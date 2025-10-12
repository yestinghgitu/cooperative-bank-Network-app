import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Input,
  FormLabel,
  Button,
  Alert,
} from "@mui/joy";
import { authAPI } from "../services/api";

const Register = ({ onBack, onSwitchToLogin }) => {
  const [form, setForm] = useState({
    username: "",
    password: "",
    full_name: "",
    email: "",
    branch: "",
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
      const res = await authAPI.register(form);
      setMsg("Registration successful!");
      setForm({ username: "", password: "", full_name: "", email: "", branch: "" });
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        bgcolor: "background.body",
      }}
    >
      <Card variant="outlined" sx={{ width: 420, borderRadius: "xl" }}>
        <CardContent>
          <Typography level="h4" textAlign="center" fontWeight={700}>
            Create Your Account
          </Typography>
          <Typography level="body-sm" textAlign="center" color="neutral.500" mb={2}>
            Join the Cooperative Bank Network
          </Typography>

          {msg && <Alert color="success">{msg}</Alert>}
          {error && <Alert color="danger">{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <Stack spacing={1.5} mt={2}>
              {["username", "password", "full_name", "email", "branch"].map((field) => (
                <Box key={field}>
                  <FormLabel sx={{ textTransform: "capitalize" }}>{field.replace("_", " ")}</FormLabel>
                  <Input
                    name={field}
                    type={field === "password" ? "password" : "text"}
                    value={form[field]}
                    onChange={handleChange}
                    variant="soft"
                    required
                  />
                </Box>
              ))}
              <Button type="submit" loading={loading}>
                {loading ? "Registering..." : "Register"}
              </Button>
            </Stack>
          </form>

          <Stack direction="row" justifyContent="space-between" mt={2}>
            <Button variant="plain" onClick={onBack}>
              ← Back
            </Button>
            <Button variant="plain" onClick={onSwitchToLogin}>
              Already have an account?
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Register;
