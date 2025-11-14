import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Input,
  Button,
  FormLabel,
  IconButton,
  Alert,
  CircularProgress,
  useColorScheme,
} from "@mui/joy";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { authAPI } from "../services/api";
import logo from "../assets/conetx_logo_new.png";
import AuthFooter from "../components/AuthFooter";

const LoginPage = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const { mode } = useColorScheme();
  const usernameRef = useRef(null);

  useEffect(() => {
    if (usernameRef.current) usernameRef.current.focus();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!username.trim() || !password) {
      setErrorMsg("Please enter both username and password.");
      return;
    }

    setLoading(true);
    try {
      const res = await authAPI.login({ username, password });
      const { access_token, user } = res.data || {};
      if (!access_token || !user) throw new Error("Invalid login response.");

      localStorage.setItem("authToken", access_token);
      localStorage.setItem("user", JSON.stringify(user));
      onLogin(user);
    } catch (err) {
      console.error("Login failed:", err);
      const serverError =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Invalid username or password.";
      setErrorMsg(serverError);
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
          backdropFilter: "blur(8px)",
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
              mt: -0.5,
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
                transformOrigin: "center",
                transition: "transform 0.3s ease",
                filter:
                  mode === "dark"
                    ? "brightness(1.1) drop-shadow(0 0 3px rgba(255,255,255,0.3))"
                    : "drop-shadow(0 1px 2px rgba(0,0,0,0.25))",
              }}
            />
          </Box>

          <Typography level="body-sm" mb={1} color="neutral.500">
            Bringing cooperatives together — securely and digitally.
          </Typography>

          {errorMsg && (
            <Alert color="danger" variant="soft" sx={{ mb: 2 }}>
              {errorMsg}
            </Alert>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} noValidate>
            <Stack spacing={1.5}>
              <Box>
                <FormLabel>Username</FormLabel>
                <Input
                  variant="soft"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  fullWidth
                  slotProps={{ input: { ref: usernameRef } }}
                />
              </Box>

              <Box>
                <FormLabel>Password</FormLabel>
                <Input
                  variant="soft"
                  placeholder="Enter your password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  fullWidth
                  endDecorator={
                    <IconButton
                      variant="plain"
                      color="neutral"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  }
                />
              </Box>

              <Button
                type="submit"
                disabled={loading}
                fullWidth
                sx={{ py: 1.2, fontWeight: 600 }}
              >
                {loading ? <CircularProgress size="sm" /> : "Sign In"}
              </Button>

              {/* Forgot Password Link */}
              <Box sx={{ textAlign: "center", mt: 1 }}>
                <Typography
                  level="body-sm"
                  component="a"
                  href="/forgot-password"
                  sx={{
                    color: "primary.600",
                    textDecoration: "underline",
                    cursor: "pointer",
                    "&:hover": { color: "primary.800" },
                  }}
                >
                  Forgot password?
                </Typography>
              </Box>
            </Stack>
          </form>

          {/* Contact Info */}
          <Typography level="body-xs" mt={1.5} color="neutral.500">
            For inquiries, contact:{" "}
            <a href="tel:+917892611670" style={{ color: "#1a73e8" }}>
              +91 78926 11670
            </a>{" "}
            |{" "}
            <a href="tel:+919480595927" style={{ color: "#1a73e8" }}>
              +91 94805 95927
            </a>{" "}
            |{" "}
            <a
              href="mailto:b2bnetworkguide@gmail.com"
              style={{ color: "#1a73e8" }}
            >
              b2bnetworkguide@gmail.com
            </a>
          </Typography>
        </CardContent>
      </Card>

      {/* Modern Reusable Footer */}
      <AuthFooter />
    </Box>
  );
};

export default LoginPage;
