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
  useColorScheme,
} from "@mui/joy";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { authAPI } from "../services/api";
import logo from "../assets/logo_login.png"; // ✅ use the transparent version

const LoginPage = ({ onLogin, onSwitchRegister }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const { mode } = useColorScheme(); // detect dark/light mode

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
      const { access_token, user } = res.data;
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
        px: 2,
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
          backdropFilter: "blur(6px)",
        }}
      >
        <CardContent>
          {/* Logo */}
          <Box sx={{ display: "flex", justifyContent: "center", mb: 1 }}>
            <img
              src={logo}
              alt="Cooperative Bank Network Logo"
              width={200}
              height="auto"
              style={{
                borderRadius: "10px",
                filter:
                  mode === "dark"
                    ? "brightness(1.1) drop-shadow(0 0 3px rgba(255,255,255,0.3))"
                    : "drop-shadow(0 0px 0px rgba(0,0,0,0.25))",
              }}
            />
          </Box>

          <Typography level="body-sm" mb={1} color="neutral.500">
            Bringing cooperative banks together — securely and digitally.
          </Typography>

          {errorMsg && (
            <Alert color="danger" variant="soft" sx={{ mb: 2 }}>
              {errorMsg}
            </Alert>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit}>
            <Stack spacing={1.5}>
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

              <Button
                type="submit"
                disabled={loading}
                fullWidth
                sx={{ py: 1.2 }}
              >
                {loading ? <CircularProgress size="sm" /> : "Sign In"}
              </Button>
            </Stack>
          </form>

          {/* <Stack direction="row" justifyContent="center" mt={2}>
            <Button variant="plain" onClick={onSwitchRegister}>
              Don’t have an account? Sign up
            </Button>
          </Stack> */}

          <Typography level="body-xs" mt={2} color="neutral.500">
            For inquiries, please contact:{" "}
            <a href="tel:+917892611670" style={{ color: "#1a73e8" }}>
              +91 78926 11670
            </a>{" "}
            |{" "}
            {/* <a href="tel:+919513189111" style={{ color: "#1a73e8" }}>
              +91 95131 89111
            </a>{" "} */}
             <a href="mailto:b2bnetworkguide@gmail.com" style={{ color: "#1a73e8" }}>
              b2bnetworkguide@gmail.com
            </a>{" "}
            {/* |{" "}
            <a href="tel:+919738958721" style={{ color: "#1a73e8" }}>
              +91 97389 58721
            </a> */}
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default LoginPage;
