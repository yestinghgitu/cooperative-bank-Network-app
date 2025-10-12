import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  FormLabel,
  Input,
  Button,
  Alert,
} from "@mui/joy";
import { loanAPI } from "../services/api";

const CreateLoan = ({ onBack }) => {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    mobileNumber: "",
    aadharNumber: "",
    amount: "",
    purpose: "",
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg(null);
    setError(null);
    setLoading(true);
    try {
      await loanAPI.safeCreate(form);
      setMsg("Loan application submitted successfully!");
      setForm({
        first_name: "",
        last_name: "",
        mobileNumber: "",
        aadharNumber: "",
        amount: "",
        purpose: "",
      });
    } catch (err) {
      setError("Failed to submit application");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Button variant="plain" onClick={onBack} color="neutral" sx={{ mb: 2 }}>
        ← Back to Dashboard
      </Button>
      <Card variant="outlined" sx={{ maxWidth: 600, mx: "auto", borderRadius: "xl" }}>
        <CardContent>
          <Typography level="h4" mb={2}>
            Create Loan Application
          </Typography>

          {msg && <Alert color="success">{msg}</Alert>}
          {error && <Alert color="danger">{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <Stack spacing={1.5}>
              {[
                ["First Name", "first_name"],
                ["Last Name", "last_name"],
                ["Mobile Number", "mobileNumber"],
                ["Aadhar Number", "aadharNumber"],
                ["Loan Amount", "amount"],
                ["Purpose", "purpose"],
              ].map(([label, name]) => (
                <Box key={name}>
                  <FormLabel>{label}</FormLabel>
                  <Input
                    name={name}
                    value={form[name]}
                    onChange={handleChange}
                    required
                    variant="soft"
                  />
                </Box>
              ))}
              <Button type="submit" loading={loading}>
                Submit
              </Button>
            </Stack>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CreateLoan;
