import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Input,
  Select,
  Option,
  Textarea,
  Button,
  Alert,
  Divider,
  Modal,
  ModalDialog,
  ModalClose,
} from "@mui/joy";
import { motion, AnimatePresence } from "framer-motion";
import { loanAPI, uploadAPI, authAPI, superAdminAPI } from "../services/api";
import { jwtDecode } from "jwt-decode";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { State, City } from "country-state-city";
import Autocomplete from "@mui/joy/Autocomplete";

// Load Indian states and cities
const allStates = State.getStatesOfCountry("IN");
const stateOptions = allStates.map((st) => ({
  value: st.isoCode,
  label: st.name,
}));

const getCitiesByState = (stateCode) =>
  City.getCitiesOfState("IN", stateCode).map((city) => ({
    value: city.name,
    label: city.name,
  }));

const getCurrentUser = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  return (
    user || {
      role: "user",
      bank_name: "",
      branch_name: "",
      bank_id: "",
      branch_id: "",
    }
  );
};

const CreateLoan = () => {
  const currentUser = getCurrentUser();
  const navigate = useNavigate();
  const previousSocietyRef = useRef("");

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    gender: "",
    date_of_birth: "",
    aadhar_number: "",
    pan_number: "",
    mobile_number: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    loan_type: "Personal",
    loan_amount: "",
    status: "Due",
    society_name: "",
    branch: "",
    bank_id: "",
    branch_id: "",
    remarks: "",
    photo_url: "",
    created_by: "",
    modified_by: "",
  });

  const [banks, setBanks] = useState([]);
  const [branches, setBranches] = useState([]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [validation, setValidation] = useState({});
  const [successModal, setSuccessModal] = useState(false);
  const [applicationId, setApplicationId] = useState("");
  const [cityOptions, setCityOptions] = useState([]);

  // ------------------ Fetch profile ------------------
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) return;
        const decoded = jwtDecode(token);
        const username = decoded?.username || decoded?.sub || "Unknown User";

        const res = await authAPI.getProfile({
          headers: { Authorization: `Bearer ${token}` },
        });
        const user = res?.data?.user || res?.data || {};

        setForm((prev) => ({
          ...prev,
          created_by: username,
          modified_by: username,
          society_name: user.bank_name || user.bank || "",
          branch: user.branch_name || user.branch || "",
          bank_id: user.bank_id || "",
          branch_id: user.branch_id || "",
        }));
      } catch (err) {
        console.error("❌ Failed to load profile:", err);
      }
    };
    fetchProfile();
  }, []);

  // ------------------ Fetch banks ------------------
  useEffect(() => {
    const fetchBanks = async () => {
      try {
        if (currentUser.role === "admin") {
          const res = await superAdminAPI.getBanks(1, 1000, "");
          setBanks(res.data?.data || []);
        } else {
          setBanks([
            { bank_name: currentUser.bank_name, id: currentUser.bank_id },
          ]);
        }
      } catch (err) {
        console.error("❌ Failed to fetch banks:", err);
        toast.error("Failed to fetch societies");
      }
    };
    fetchBanks();
  }, [currentUser.role]);

  // ------------------ Fetch branches ------------------
  useEffect(() => {
    const fetchBranches = async () => {
      if (
        form.society_name &&
        previousSocietyRef.current !== form.society_name
      ) {
        try {
          if (currentUser.role === "admin") {
            const res = await superAdminAPI.getBranches(form.society_name);
            setBranches(res.data?.data || []);
          } else {
            setBranches([
              {
                branch_name: currentUser.branch_name,
                id: currentUser.branch_id,
              },
            ]);
          }
          previousSocietyRef.current = form.society_name;
        } catch (err) {
          console.error("❌ Failed to fetch branches:", err);
          toast.error("Failed to fetch branches");
        }
      }
    };
    fetchBranches();
  }, [form.society_name, currentUser]);

  // ------------------ Validation ------------------
  const validateField = (name, value) => {
    let message = "";
    if (name === "aadhar_number" && value && !/^\d{12}$/.test(value))
      message = "Aadhar number must be exactly 12 digits.";
    if (name === "mobile_number" && value && !/^\d{10}$/.test(value))
      message = "Mobile number must be exactly 10 digits.";
    if (name === "loan_amount" && value && Number(value) <= 0)
      message = "Loan amount must be greater than zero.";
    if (name === "pincode" && value && !/^\d{6}$/.test(value))
      message = "Pincode must be exactly 6 digits.";
    if (
      name === "pan_number" &&
      value &&
      !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i.test(value)
    )
      message = "PAN number must be valid (e.g. ABCDE1234F).";
    setValidation((prev) => ({ ...prev, [name]: message }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    validateField(name, value);
  };

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handlePhotoUpload = async () => {
    if (!file) return null;
    setUploading(true);
    try {
      const data = new FormData();
      data.append("photo", file);
      const res = await uploadAPI.uploadPhoto(data);
      setUploading(false);
      return res.data.photo_url;
    } catch {
      setUploading(false);
      setError("❌ Photo upload failed. Try again.");
      return null;
    }
  };

  // ------------------ Submit ------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (Object.values(validation).some((v) => v)) {
      setError("⚠️ Please fix validation errors before submitting.");
      return;
    }

    setLoading(true);
    try {
      let photoUrl = form.photo_url;
      if (file) {
        photoUrl = await handlePhotoUpload();
        if (!photoUrl) {
          setLoading(false);
          return;
        }
      }

      const formatDateForBackend = (d) => {
        if (!d) return "";
        const date = new Date(d);
        return `${String(date.getDate()).padStart(2, "0")}-${String(
          date.getMonth() + 1
        ).padStart(2, "0")}-${date.getFullYear()}`;
      };

      const payload = {
        ...form,
        date_of_birth: formatDateForBackend(form.date_of_birth),
        photo_url: photoUrl,
        bank_id:
          banks.find((b) => b.bank_name === form.society_name)?.id ||
          form.bank_id,
        branch_id:
          branches.find((b) => b.branch_name === form.branch)?.id ||
          form.branch_id,
      };

      const res = await loanAPI.createApplication(payload);
      setApplicationId(res.data.application_id);
      setSuccessModal(true);
      setTimeout(() => setSuccessModal(false), 2000);

      setForm({
        ...form,
        first_name: "",
        last_name: "",
        gender: "",
        date_of_birth: "",
        aadhar_number: "",
        pan_number: "",
        mobile_number: "",
        email: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
        loan_amount: "",
        remarks: "",
      });
      setFile(null);
      setValidation({});
    } catch (err) {
      console.error(err);
      setError("❌ Failed to submit loan application. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ------------------ JSX Form ------------------
  return (
    <Box sx={{ p: 3 }}>
      <Button
        variant="plain"
        color="neutral"
        onClick={() => navigate("/dashboard")}
        sx={{ mb: 2 }}
      >
        ← Back to Home
      </Button>

      <Card
        variant="outlined"
        sx={{ maxWidth: 800, mx: "auto", borderRadius: "xl", p: 3 }}
      >
        <CardContent>
          <Typography level="h4" fontWeight="lg" mb={2}>
            📝 Create Loan
          </Typography>

          {error && <Alert color="danger">{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <Stack spacing={1.6}>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                <Input
                  name="first_name"
                  placeholder="First Name *"
                  value={form.first_name}
                  onChange={handleChange}
                  required
                  variant="soft"
                />
                <Input
                  name="last_name"
                  placeholder="Last Name *"
                  value={form.last_name}
                  onChange={handleChange}
                  required
                  variant="soft"
                />
              </Stack>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                <Select
                  name="gender"
                  placeholder="Select Gender *"
                  value={form.gender}
                  onChange={(_, v) => setForm({ ...form, gender: v })}
                  required
                  variant="soft"
                >
                  <Option value="Male">Male</Option>
                  <Option value="Female">Female</Option>
                  <Option value="Other">Other</Option>
                </Select>
                <Input
                  type="date"
                  name="date_of_birth"
                  value={form.date_of_birth}
                  onChange={handleChange}
                  required
                  variant="soft"
                />
              </Stack>

              <Divider />

              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                <Box sx={{ flex: 1 }}>
                  <Input
                    name="aadhar_number"
                    placeholder="Aadhar Number *"
                    value={form.aadhar_number}
                    onChange={handleChange}
                    required
                    variant="soft"
                    error={validation.aadhar_number ? true : undefined}
                  />
                  {validation.aadhar_number && (
                    <Typography level="body-xs" color="danger">
                      {validation.aadhar_number}
                    </Typography>
                  )}
                </Box>

                <Box sx={{ flex: 1 }}>
                  <Input
                    name="pan_number"
                    placeholder="PAN"
                    value={form.pan_number}
                    onChange={handleChange}
                    variant="soft"
                    error={validation.pan_number ? true : undefined}
                  />
                  {validation.pan_number && (
                    <Typography level="body-xs" color="danger">
                      {validation.pan_number}
                    </Typography>
                  )}
                </Box>

                <Box sx={{ flex: 1 }}>
                  <Input
                    name="mobile_number"
                    placeholder="Mobile *"
                    value={form.mobile_number}
                    onChange={handleChange}
                    required
                    variant="soft"
                    error={validation.mobile_number ? true : undefined}
                  />
                  {validation.mobile_number && (
                    <Typography level="body-xs" color="danger">
                      {validation.mobile_number}
                    </Typography>
                  )}
                </Box>
              </Stack>

              <Input
                type="email"
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                variant="soft"
              />
              <Textarea
                name="address"
                placeholder="Address"
                minRows={2}
                value={form.address}
                onChange={handleChange}
                variant="soft"
              />

              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                <Autocomplete
                  placeholder="Select or Type State"
                  options={stateOptions.map((s) => s.label)}
                  value={form.state || ""}
                  freeSolo
                  onChange={(_, newValue) => {
                    const selectedState = allStates.find(
                      (st) => st.name === newValue || st.isoCode === newValue
                    );
                    setForm({ ...form, state: newValue || "", city: "", pincode: "" });

                    if (selectedState) {
                      const cities = getCitiesByState(selectedState.isoCode);
                      setCityOptions(cities);
                    } else {
                      setCityOptions([]);
                    }
                  }}
                  onInputChange={(_, newValue) => {
                    setForm({ ...form, state: newValue, city: "", pincode: "" });
                    setCityOptions([]);
                  }}
                  variant="soft"
                />

                <Autocomplete
                  placeholder="Select or Type City"
                  options={cityOptions.map((c) => c.label)}
                  value={form.city || ""}
                  freeSolo
                  onChange={(_, newValue) => {
                    setForm({ ...form, city: newValue || "" });
                  }}
                  onInputChange={(_, newValue) => {
                    setForm({ ...form, city: newValue });
                  }}
                  variant="soft"
                  disabled={!form.state}
                />

                <Box sx={{ flex: 1 }}>
                  <Input
                    name="pincode"
                    placeholder="Pincode"
                    value={form.pincode}
                    onChange={handleChange}
                    variant="soft"
                    error={validation.pincode ? true : undefined}
                  />
                  {validation.pincode && (
                    <Typography level="body-xs" color="danger">
                      {validation.pincode}
                    </Typography>
                  )}
                </Box>
              </Stack>

              <Divider />

              <Stack direction="column" spacing={1.5}>
                {currentUser.role === "admin" ? (
                  <Select
                    name="society_name"
                    placeholder="Select Society"
                    value={form.bank_id || ""}
                    onChange={(_, val) => {
                      const selected = banks.find((b) => b.id === val);
                      setForm({
                        ...form,
                        society_name: selected?.bank_name || "",
                        bank_id: val,
                        branch: "",
                        branch_id: "",
                      });
                    }}
                    variant="soft"
                  >
                    {banks.map((b) => (
                      <Option key={b.id} value={b.id}>
                        {b.bank_name}
                      </Option>
                    ))}
                  </Select>
                ) : (
                  <Input
                    readOnly
                    value={currentUser.bank_name || form.society_name}
                    variant="soft"
                  />
                )}

                {currentUser.role === "admin" ? (
                  <Select
                    name="branch"
                    placeholder="Select Branch"
                    value={form.branch_id || ""}
                    onChange={(_, val) => {
                      const selected = branches.find((b) => b.id === val);
                      setForm({
                        ...form,
                        branch: selected?.branch_name || "",
                        branch_id: val,
                      });
                    }}
                    variant="soft"
                  >
                    {branches.map((b) => (
                      <Option key={b.id} value={b.id}>
                        {b.branch_name}
                      </Option>
                    ))}
                  </Select>
                ) : (
                  <Input
                    readOnly
                    value={currentUser.branch_name || form.branch}
                    variant="soft"
                  />
                )}
              </Stack>

              <Divider />

              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                <Select
                  name="loan_type"
                  value={form.loan_type}
                  onChange={(_, v) => {
                    setForm({ ...form, loan_type: v });
                    validateField("loan_type", v);
                  }}
                  required
                  variant="soft"
                >
                  <Option value="Personal">Personal</Option>
                  <Option value="Home">Home</Option>
                  <Option value="Vehicle">Vehicle</Option>
                  <Option value="Education">Education</Option>
                </Select>

                <Box sx={{ flex: 1 }}>
                  <Input
                    type="number"
                    name="loan_amount"
                    placeholder="Loan Amount (₹) *"
                    value={form.loan_amount}
                    onChange={handleChange}
                    required
                    variant="soft"
                    error={validation.loan_amount ? true : undefined}
                  />
                  {validation.loan_amount && (
                    <Typography level="body-xs" color="danger">
                      {validation.loan_amount}
                    </Typography>
                  )}
                </Box>

                <Select
                  name="status"
                  value={form.status}
                  onChange={(_, v) => setForm({ ...form, status: v })}
                  variant="soft"
                >
                  <Option value="Due">Due</Option>
                  <Option value="Overdue">Overdue</Option>
                  <Option value="Litigation">Litigation</Option>
                  <Option value="Running">Running</Option>
                </Select>
              </Stack>

              <Textarea
                name="remarks"
                placeholder="Remarks"
                minRows={2}
                value={form.remarks}
                onChange={handleChange}
                variant="soft"
              />

              <Input type="file" accept="image/*" onChange={handleFileChange} />

              <Box sx={{ textAlign: "center", mt: 2 }}>
                <Button
                  type="submit"
                  loading={loading || uploading}
                  variant="solid"
                  color="primary"
                >
                  {uploading ? "Uploading..." : "Submit"}
                </Button>
              </Box>
            </Stack>
          </form>
        </CardContent>
      </Card>

      <AnimatePresence>
        {successModal && (
          <Modal open={successModal} onClose={() => setSuccessModal(false)}>
            <motion.div
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <ModalDialog
                variant="soft"
                color="success"
                sx={{ borderRadius: "lg", textAlign: "center", p: 3 }}
              >
                <ModalClose variant="plain" />
                <Typography level="h5" color="success" mb={1}>
                  Loan Created Successfully!
                </Typography>
                <Typography level="body-md" mb={2}>
                  Loan ID:
                </Typography>
                <Typography
                  level="h4"
                  sx={{
                    fontWeight: "bold",
                    color: "var(--joy-palette-success-700)",
                  }}
                >
                  {applicationId}
                </Typography>
                <Typography level="body-sm" mt={2} color="neutral">
                  Closing automatically in 2 seconds...
                </Typography>
              </ModalDialog>
            </motion.div>
          </Modal>
        )}
      </AnimatePresence>
    </Box>
  );
};

export default CreateLoan;
