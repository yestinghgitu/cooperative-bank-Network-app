import React, { useState } from "react";
import {
  Box,
  Typography,
  Sheet,
  Button,
  Stack,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Option,
  Snackbar,
  Alert,
  FormHelperText,
} from "@mui/joy";

const Contact = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    category: "General Inquiry",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: "", color: "success" });
  const [loading, setLoading] = useState(false);

  // ----------------------------
  // Validation helper functions
  // ----------------------------
  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);
  const validateForm = () => {
    const newErrors = {};

    if (!form.name.trim()) newErrors.name = "Name is required.";
    else if (form.name.length < 2) newErrors.name = "Name must be at least 2 characters.";

    if (!form.email.trim()) newErrors.email = "Email is required.";
    else if (!validateEmail(form.email)) newErrors.email = "Invalid email format.";

    if (form.phone.length > 0 && !/^\+?[0-9]{7,15}$/.test(form.phone)) 
      newErrors.phone = "Invalid phone number.";

    if (!form.subject.trim()) newErrors.subject = "Subject is required.";

    if (!form.message.trim()) newErrors.message = "Message is required.";
    else if (form.message.length < 10)
      newErrors.message = "Message should be at least 10 characters long.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ----------------------------
  // Input change handler
  // ----------------------------
  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  // ----------------------------
  // Form submit handler
  // ----------------------------
  const handleSubmit = async () => {
    if (!validateForm()) {
      setSnackbar({ open: true, message: "Please correct the highlighted fields.", color: "danger" });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setSnackbar({ open: true, message: "Message sent successfully!", color: "success" });
        setForm({
          name: "",
          email: "",
          phone: "",
          subject: "",
          category: "General Inquiry",
          message: "",
        });
        setErrors({});
      } else {
        throw new Error("Failed to send message");
      }
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: "Error sending message.", color: "danger" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", my: 6, px: 3 }}>
      <Sheet
        variant="outlined"
        sx={{
          p: { xs: 3, md: 5 },
          borderRadius: "lg",
          boxShadow: "md",
          bgcolor: "background.body",
        }}
      >
        {/* Title */}
        <Typography level="h3" textAlign="center" sx={{ color: "primary.plainColor", mb: 1 }}>
          Contact Us
        </Typography>
        <Typography
          level="body-sm"
          textAlign="center"
          sx={{ mb: 4, color: "text.tertiary" }}
        >
          We’d love to hear from you! Fill out the form below or email us directly.
        </Typography>

        {/* Contact Form */}
        <Stack spacing={2}>
          {/* Name */}
          <FormControl error={!!errors.name}>
            <FormLabel>Your Name</FormLabel>
            <Input
              placeholder="Enter your name"
              variant="soft"
              fullWidth
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />
            {errors.name && <FormHelperText>{errors.name}</FormHelperText>}
          </FormControl>

          {/* Email */}
          <FormControl error={!!errors.email}>
            <FormLabel>Email Address</FormLabel>
            <Input
              placeholder="Enter your email"
              type="email"
              variant="soft"
              fullWidth
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
            />
            {errors.email && <FormHelperText>{errors.email}</FormHelperText>}
          </FormControl>

          {/* Phone */}
          <FormControl error={!!errors.phone}>
            <FormLabel>Phone Number</FormLabel>
            <Input
              placeholder="Enter your phone number"
              variant="soft"
              fullWidth
              value={form.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
            />
            {errors.phone && <FormHelperText>{errors.phone}</FormHelperText>}
          </FormControl>

          {/* Subject */}
          <FormControl error={!!errors.subject}>
            <FormLabel>Subject</FormLabel>
            <Input
              placeholder="Enter subject"
              variant="soft"
              fullWidth
              value={form.subject}
              onChange={(e) => handleChange("subject", e.target.value)}
            />
            {errors.subject && <FormHelperText>{errors.subject}</FormHelperText>}
          </FormControl>

          {/* Category */}
          <FormControl>
            <FormLabel>Category</FormLabel>
            <Select
              variant="soft"
              value={form.category}
              onChange={(_, value) => handleChange("category", value)}
            >
              <Option value="General Inquiry">General Inquiry</Option>
              <Option value="Support">Support</Option>
              <Option value="Feedback">Feedback</Option>
              <Option value="Loan Query">Loan Query</Option>
              <Option value="Bug Report">Bug Report</Option>
              <Option value="Other">Other</Option>
            </Select>
          </FormControl>

          {/* Message */}
          <FormControl error={!!errors.message}>
            <FormLabel>Message</FormLabel>
            <Textarea
              placeholder="Your message..."
              minRows={4}
              variant="soft"
              fullWidth
              value={form.message}
              onChange={(e) => handleChange("message", e.target.value)}
            />
            {errors.message && <FormHelperText>{errors.message}</FormHelperText>}
          </FormControl>

          {/* Submit Button */}
          <Button
            color="primary"
            size="lg"
            onClick={handleSubmit}
            loading={loading}
            disabled={loading}
            sx={{
              alignSelf: "center",
              mt: 2,
              px: 4,
              borderRadius: "xl",
            }}
          >
            Send Message
          </Button>
        </Stack>

        {/* Footer Text */}
        <Typography level="body-sm" textAlign="center" sx={{ mt: 4, color: "text.tertiary" }}>
          Or email us directly at <strong>conetx.notifications@gmail.com</strong>
        </Typography>
      </Sheet>

      {/* Snackbar Notifications */}
      <Snackbar
        open={snackbar.open}
        color={snackbar.color}
        autoHideDuration={3000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert color={snackbar.color}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default Contact;
