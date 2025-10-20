import React, { useState, useEffect } from "react";
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
import { loanAPI, uploadAPI } from "../services/api";
import {jwtDecode} from "jwt-decode";

const CreateLoan = ({ onBack }) => {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    gender: "",
    date_of_birth: "",
    aadhar_number: "",
    voter_id: "",
    mobile_number: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    loan_type: "Personal",
    loan_amount: "",
    status: "Due",
    society: "",
    remarks: "",
    photo_url: "",
    created_by: "",
    modified_by: "",
  });

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [validation, setValidation] = useState({});
  const [successModal, setSuccessModal] = useState(false);
  const [applicationId, setApplicationId] = useState("");

  useEffect(() => {
  try {
    const token = localStorage.getItem("access_token");
    if (token) {
      const decoded = jwtDecode.default(token);
      const username = decoded?.username || decoded?.sub || "Unknown User";
      setForm((prev) => ({
        ...prev,
        created_by: username,
        modified_by: username,
      }));
    }
  } catch (err) {
    console.warn("Token decode failed:", err);
  }
}, []);


  // Validation rules
  const validateField = (name, value) => {
    let message = "";
    if (name === "aadhar_number" && value && !/^\d{12}$/.test(value))
      message = "Aadhar number must be exactly 12 digits.";
    if (name === "mobile_number" && value && !/^\d{10}$/.test(value))
      message = "Mobile number must be exactly 10 digits.";
    if (name === "loan_amount" && value && Number(value) <= 0)
      message = "Loan amount must be greater than zero.";
    if (name === "voter_id" && value && !/^[a-zA-Z0-9]{6,15}$/.test(value))
      message = "Voter ID must be alphanumeric (6-15 chars).";
    if (name === "pincode" && value && !/^\d{6}$/.test(value))
      message = "Pincode must be exactly 6 digits.";
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
    } catch (err) {
      setUploading(false);
      setError("❌ Photo upload failed. Try again.");
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const invalid = Object.values(validation).some((v) => v);
    if (invalid) {
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

      const formatDateForBackend = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
      };

      const payload = {
        ...form,
        date_of_birth: formatDateForBackend(form.date_of_birth),
        photo_url: photoUrl,
      };

      const res = await loanAPI.createApplication(payload);

      setApplicationId(res.data.application_id);
      setSuccessModal(true);

      setTimeout(() => setSuccessModal(false), 2000);

      // Reset form
      setForm({
        first_name: "",
        last_name: "",
        gender: "",
        date_of_birth: "",
        aadhar_number: "",
        voter_id: "",
        mobile_number: "",
        email: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
        loan_type: "Personal",
        loan_amount: "",
        status: "Due",
        society: "",
        remarks: "",
        photo_url: "",
        created_by: form.created_by,
        modified_by: form.modified_by,
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

  return (
    <Box sx={{ p: 3 }}>
      <Button variant="plain" color="neutral" onClick={onBack} sx={{ mb: 2 }}>
        ← Back to Dashboard
      </Button>

      <Card variant="outlined" sx={{ maxWidth: 800, mx: "auto", borderRadius: "xl", p: 3 }}>
        <CardContent>
          <Typography level="h4" fontWeight="lg" mb={2}>
            Create Loan
          </Typography>

          {error && <Alert color="danger" sx={{ mb: 2 }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <Stack spacing={1.6}>
              {/* Personal Details */}
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                <Input name="first_name" placeholder="First Name *" value={form.first_name} onChange={handleChange} required variant="soft" />
                <Input name="last_name" placeholder="Last Name *" value={form.last_name} onChange={handleChange} required variant="soft" />
              </Stack>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                <Select
                  name="gender"
                  value={form.gender}
                  onChange={(_, val) => setForm({ ...form, gender: val })}
                  required
                  variant="soft"
                  placeholder="Select Gender *"
                >
                  <Option value="Male">Male</Option>
                  <Option value="Female">Female</Option>
                  <Option value="Other">Other</Option>
                </Select>
                <Input type="date" name="date_of_birth" value={form.date_of_birth} onChange={handleChange} required variant="soft" />
              </Stack>

              <Divider sx={{ my: 1 }} />

              {/* Contact Info */}
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                <Input name="aadhar_number" placeholder="Aadhar Number *" value={form.aadhar_number} onChange={handleChange} required variant="soft" maxLength={12} color={validation.aadhar_number ? "danger" : "neutral"} />
                <Input name="voter_id" placeholder="Voter ID *" value={form.voter_id} onChange={handleChange} required variant="soft" color={validation.voter_id ? "danger" : "neutral"} />
                <Input name="mobile_number" placeholder="Mobile Number *" value={form.mobile_number} onChange={handleChange} required variant="soft" maxLength={10} color={validation.mobile_number ? "danger" : "neutral"} />
              </Stack>

              <Input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} variant="soft" />
              <Textarea name="address" placeholder="Address" minRows={2} value={form.address} onChange={handleChange} variant="soft" />

              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                <Input name="city" placeholder="City" value={form.city} onChange={handleChange} variant="soft" />
                <Input name="state" placeholder="State" value={form.state} onChange={handleChange} variant="soft" />
                <Input name="pincode" placeholder="Pincode" value={form.pincode} onChange={handleChange} variant="soft" maxLength={6} color={validation.pincode ? "danger" : "neutral"} />
              </Stack>

              <Divider sx={{ my: 1 }} />

              {/* Loan Info */}
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                <Select name="loan_type" value={form.loan_type} onChange={(_, v) => setForm({ ...form, loan_type: v })} required variant="soft">
                  <Option value="Personal">Personal Loan</Option>
                  <Option value="Home">Home Loan</Option>
                  <Option value="Vehicle">Vehicle Loan</Option>
                  <Option value="Education">Education Loan</Option>
                </Select>
                <Input type="number" name="loan_amount" placeholder="Loan Amount (₹) *" value={form.loan_amount} onChange={handleChange} required variant="soft" color={validation.loan_amount ? "danger" : "neutral"} />
                <Select name="status" value={form.status} onChange={(_, v) => setForm({ ...form, status: v })} variant="soft">
                  <Option value="Due">Due</Option>
                  <Option value="Overdue">Overdue</Option>
                  <Option value="Litigation">Litigation</Option>
                  <Option value="Running">Running</Option>
                </Select>
              </Stack>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                <Input name="society" placeholder="Society" value={form.society} onChange={handleChange} variant="soft" />
              </Stack>

              <Textarea name="remarks" placeholder="Remarks" minRows={2} value={form.remarks} onChange={handleChange} variant="soft" />

              <Input type="file" accept="image/*" onChange={handleFileChange} variant="soft" />

              {/* Sticky Submit */}
              <Box
                sx={{
                  position: "sticky",
                  bottom: 0,
                  background: "white",
                  py: 1,
                  borderTop: "1px solid #eee",
                  textAlign: "center",
                }}
              >
                <Button type="submit" loading={loading || uploading} variant="solid" color="primary" sx={{ px: 4 }}>
                  {uploading ? "Uploading..." : "Submit"}
                </Button>
              </Box>
            </Stack>
          </form>
        </CardContent>
      </Card>

      {/* Animated Success Modal */}
      <AnimatePresence>
        {successModal && (
          <Modal open={successModal} onClose={() => setSuccessModal(false)}>
            <motion.div
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <ModalDialog variant="soft" color="success" sx={{ borderRadius: "lg", textAlign: "center", p: 3 }}>
                <ModalClose variant="plain" />
                <Typography level="h5" color="success" mb={1}>
                  Loan created Successfully!
                </Typography>
                <Typography level="body-md" mb={2}>
                  Loan ID is:
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
                  This message will close automatically in 2 seconds.
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
