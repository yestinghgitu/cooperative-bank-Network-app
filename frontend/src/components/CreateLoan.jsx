import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  FormLabel,
  Input,
  Select,
  Option,
  Textarea,
  Button,
  Alert,
} from "@mui/joy";
import { loanAPI, uploadAPI } from "../services/api";
import { jwtDecode } from "jwt-decode"; // npm install jwt-decode

const CreateLoan = ({ onBack }) => {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    gender: "",
    date_of_birth: "",
    aadhar_number: "",
    mobile_number: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    loan_type: "Personal",
    loan_amount: "",
    photo_url: "",
    society: "",
    voter_id: "",
    remarks: "",
    created_by: "",
    modified_by: "",
  });

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [error, setError] = useState(null);
  const [validation, setValidation] = useState({});

  // Auto-fill user info from JWT
  useEffect(() => {
    try {
      const token = localStorage.getItem("access_token");
      if (token) {
        const decoded = jwtDecode(token);
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
    if (name === "aadhar_number" && value && !/^\d{12}$/.test(value)) {
      message = "Aadhar number must be exactly 12 digits.";
    }
    if (name === "mobile_number" && value && !/^\d{10}$/.test(value)) {
      message = "Mobile number must be exactly 10 digits.";
    }
    if (name === "loan_amount" && value && Number(value) <= 0) {
      message = "Loan amount must be greater than zero.";
    }
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
      const response = await uploadAPI.uploadPhoto(data);
      setUploading(false);
      setMsg("Photo uploaded successfully!");
      return response.data.photo_url;
    } catch (err) {
      setUploading(false);
      setError("Photo upload failed. Please try again.");
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg(null);
    setError(null);

    // Check for validation errors
    const invalid = Object.values(validation).some((v) => v);
    if (invalid) {
      setError("Please fix validation errors before submitting.");
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

      const response = await loanAPI.createApplication(payload);
      setMsg(
        `✅ Loan application submitted successfully! Application ID: ${response.data.application_id}`
      );

      // Reset form
      setForm((prev) => ({
        ...prev,
        first_name: "",
        last_name: "",
        gender: "",
        date_of_birth: "",
        aadhar_number: "",
        mobile_number: "",
        email: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
        loan_type: "Personal",
        loan_amount: "",
        photo_url: "",
        society: "",
        voter_id: "",
        remarks: "",
      }));
      setFile(null);
      setValidation({});
    } catch (err) {
      console.error(err);
      setError("Failed to submit loan application. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Button variant="plain" onClick={onBack} color="neutral" sx={{ mb: 2 }}>
        ← Back to Dashboard
      </Button>

      <Card
        variant="outlined"
        sx={{ maxWidth: 750, mx: "auto", borderRadius: "xl", p: 2 }}
      >
        <CardContent>
          <Typography level="h4" mb={2}>
            Create Loan Application
          </Typography>

          {msg && <Alert color="success">{msg}</Alert>}
          {error && <Alert color="danger">{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <Stack spacing={1.6}>
              {/* Basic Info */}
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                <Box sx={{ flex: 1 }}>
                  <FormLabel>First Name *</FormLabel>
                  <Input
                    name="first_name"
                    value={form.first_name}
                    onChange={handleChange}
                    required
                    variant="soft"
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <FormLabel>Last Name *</FormLabel>
                  <Input
                    name="last_name"
                    value={form.last_name}
                    onChange={handleChange}
                    required
                    variant="soft"
                  />
                </Box>
              </Stack>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                <Box sx={{ flex: 1 }}>
                  <FormLabel>Gender *</FormLabel>
                  <Select
                    name="gender"
                    value={form.gender}
                    onChange={(_, val) => setForm({ ...form, gender: val })}
                    required
                    variant="soft"
                  >
                    <Option value="Male">Male</Option>
                    <Option value="Female">Female</Option>
                    <Option value="Other">Other</Option>
                  </Select>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <FormLabel>Date of Birth *</FormLabel>
                  <Input
                    type="date"
                    name="date_of_birth"
                    value={form.date_of_birth}
                    onChange={handleChange}
                    required
                    variant="soft"
                  />
                </Box>
              </Stack>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                <Box sx={{ flex: 1 }}>
                  <FormLabel>Aadhar Number *</FormLabel>
                  <Input
                    name="aadhar_number"
                    value={form.aadhar_number}
                    onChange={handleChange}
                    required
                    maxLength={12}
                    variant="soft"
                    color={validation.aadhar_number ? "danger" : "neutral"}
                    error={!!validation.aadhar_number}
                  />
                  {validation.aadhar_number && (
                    <Typography level="body-xs" color="danger">
                      {validation.aadhar_number}
                    </Typography>
                  )}
                </Box>
                <Box sx={{ flex: 1 }}>
                  <FormLabel>Mobile Number *</FormLabel>
                  <Input
                    name="mobile_number"
                    value={form.mobile_number}
                    onChange={handleChange}
                    required
                    maxLength={10}
                    variant="soft"
                    color={validation.mobile_number ? "danger" : "neutral"}
                    error={!!validation.mobile_number}
                  />
                  {validation.mobile_number && (
                    <Typography level="body-xs" color="danger">
                      {validation.mobile_number}
                    </Typography>
                  )}
                </Box>
              </Stack>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                <Box sx={{ flex: 1 }}>
                  <FormLabel>Loan Amount (₹) *</FormLabel>
                  <Input
                    type="number"
                    name="loan_amount"
                    value={form.loan_amount}
                    onChange={handleChange}
                    required
                    variant="soft"
                    color={validation.loan_amount ? "danger" : "neutral"}
                    error={!!validation.loan_amount}
                  />
                  {validation.loan_amount && (
                    <Typography level="body-xs" color="danger">
                      {validation.loan_amount}
                    </Typography>
                  )}
                </Box>
                <Box sx={{ flex: 1 }}>
                  <FormLabel>Loan Type *</FormLabel>
                  <Select
                    name="loan_type"
                    value={form.loan_type}
                    onChange={(_, val) => setForm({ ...form, loan_type: val })}
                    required
                    variant="soft"
                  >
                    <Option value="Personal">Personal Loan</Option>
                    <Option value="Home">Home Loan</Option>
                    <Option value="Vehicle">Vehicle Loan</Option>
                    <Option value="Education">Education Loan</Option>
                  </Select>
                </Box>
              </Stack>

              <Box>
                <FormLabel>Aadhar Upload</FormLabel>
                <Input type="file" onChange={handleFileChange} variant="soft" />
              </Box>

              <Button
                type="submit"
                loading={loading || uploading}
                color="primary"
                variant="solid"
              >
                {uploading ? "Uploading..." : "Submit Application"}
              </Button>
            </Stack>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CreateLoan;
