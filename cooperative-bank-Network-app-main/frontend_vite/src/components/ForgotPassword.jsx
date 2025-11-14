import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Input,
  Button,
  FormLabel,
  Alert,
  CircularProgress,
  useColorScheme,
} from "@mui/joy";
import { authAPI } from "../services/api";
import logo from "../assets/conetx_logo_new.png";
import AuthFooter from "../components/AuthFooter";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { mode } = useColorScheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);
    try {
      const res = await authAPI.forgotPassword(email);
      setMessage(res.data?.message || "Password reset link sent to your email.");
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.error ||
          "Failed to send password reset email. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        bgcolor: "background.body",
        p: 2,
      }}
    >
      <Card
        variant="outlined"
        sx={{
          width: 400,
          borderRadius: "xl",
          boxShadow: "lg",
          textAlign: "center",
          p: 3,
        }}
      >
        <CardContent>
          {/* Logo */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              mb: 1,
            }}
          >
            <Box
              component="img"
              src={logo}
              alt="CoNetX Logo"
              sx={{
                height: 70,
                width: "auto",
                objectFit: "contain",
                transform: "scale(1.8)",
                filter:
                  mode === "dark"
                    ? "brightness(1.1) drop-shadow(0 0 3px rgba(255,255,255,0.3))"
                    : "drop-shadow(0 1px 2px rgba(0,0,0,0.25))",
              }}
            />
          </Box>

          <Typography level="title-md" mb={1}>
            Forgot Password
          </Typography>

          <Typography level="body-sm" mb={2} color="neutral.500">
            Enter your registered email address to receive a password reset link.
          </Typography>

          {message && (
            <Alert color="success" variant="soft" sx={{ mb: 2 }}>
              {message}
            </Alert>
          )}

          {error && (
            <Alert color="danger" variant="soft" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Stack spacing={1.5}>
              <Box>
                <FormLabel>Email Address</FormLabel>
                <Input
                  variant="soft"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  fullWidth
                />
              </Box>

              <Button type="submit" fullWidth disabled={loading}>
                {loading ? <CircularProgress size="sm" /> : "Send Reset Link"}
              </Button>
            </Stack>
          </form>

          {/* Back to Login */}
          <Box sx={{ textAlign: "center", mt: 2 }}>
            <Typography
              level="body-sm"
              component="a"
              href="/login"
              sx={{
                color: "primary.600",
                textDecoration: "underline",
                cursor: "pointer",
                "&:hover": { color: "primary.800" },
              }}
            >
              Back to Login
            </Typography>
          </Box>
        </CardContent>
      </Card>

      <AuthFooter />
    </Box>
  );
};

export default ForgotPassword;
