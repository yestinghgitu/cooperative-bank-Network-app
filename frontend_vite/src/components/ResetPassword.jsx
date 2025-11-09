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
import { useParams } from "react-router-dom";
import { authAPI } from "../services/api";
import logo from "../assets/conetx_logo_new.png";
import AuthFooter from "../components/AuthFooter";

const ResetPassword = () => {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { mode } = useColorScheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!password || !confirm) {
      setError("Please fill in both fields.");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await authAPI.resetPassword(token, password);
      setMessage(res.data?.message || "Password reset successful.");
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.error ||
          "Failed to reset password. Please try again."
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
            Reset Password
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
                <FormLabel>New Password</FormLabel>
                <Input
                  variant="soft"
                  type="password"
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  fullWidth
                />
              </Box>

              <Box>
                <FormLabel>Confirm Password</FormLabel>
                <Input
                  variant="soft"
                  type="password"
                  placeholder="Re-enter new password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  fullWidth
                />
              </Box>

              <Button type="submit" fullWidth disabled={loading}>
                {loading ? <CircularProgress size="sm" /> : "Reset Password"}
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

export default ResetPassword;
