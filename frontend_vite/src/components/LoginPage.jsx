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
  IconButton,
  Alert,
  CircularProgress,
} from "@mui/joy";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { authAPI } from "../services/api";
import logo from "../assets/co_network.png"; // ensure logo.svg is in src/assets/

const LoginPage = ({ onLogin, onSwitchRegister, onStatusCheck }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

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
      const { access_token, user } = res.data; // important
      if (!access_token) throw new Error("Invalid login response");
      localStorage.setItem("authToken", access_token);
      localStorage.setItem("user", JSON.stringify(user));
      onLogin(user);
    } catch (err) {
      setErrorMsg(err.response?.data?.error || err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.body",
      }}
    >
      <Card
        variant="outlined"
        sx={{
          width: 400,
          borderRadius: "xl",
          boxShadow: "sm",
          textAlign: "center",
          p: 2,
        }}
      >
        <CardContent>
          {/* Logo Section */}
          <Box sx={{ display: "flex", justifyContent: "center", mb: 1 }}>
            <img
              src={logo}
              alt="Cooperative Bank Network Logo"
              width={80}
              height={80}
              style={{ borderRadius: "8px" }}
            />
          </Box>

          <Typography level="h4" fontWeight={700}>
            Cooperative Bank Network
          </Typography>
          <Typography level="body-sm" mb={2} color="neutral.500">
            Welcome back! Please sign in
          </Typography>

          {errorMsg && (
            <Alert color="danger" variant="soft" sx={{ mb: 2 }}>
              {errorMsg}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <Box>
                <FormLabel>Username</FormLabel>
                <Input
                  variant="soft"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  fullWidth
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

              <Button type="submit" disabled={loading}>
                {loading ? <CircularProgress size="sm" /> : "Sign In"}
              </Button>
            </Stack>
          </form>

          <Stack direction="row" justifyContent="space-between" mt={2}>
            <Button variant="plain" onClick={onSwitchRegister}>
              Create Account
            </Button>
            <Button variant="plain" color="primary" onClick={onStatusCheck}>
              Check Loan Status
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

export default LoginPage;
