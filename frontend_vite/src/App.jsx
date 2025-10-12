// src/App.jsx
import React, { useState, useEffect } from "react";
import { CssVarsProvider, extendTheme } from "@mui/joy/styles";
import CssBaseline from "@mui/joy/CssBaseline";
import Box from "@mui/joy/Box";
import Typography from "@mui/joy/Typography";
import LoginPage from "./components/LoginPage";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import CreateLoan from "./components/CreateLoan";
import ViewApplications from "./components/ViewApplications";
import Services from "./components/Services";
import LoanSearch from "./components/LoanSearch";
import LoanStatusCheck from "./components/LoanStatusCheck";
import NavBar from "./components/NavBar";
import { authAPI } from "./services/api";

const theme = extendTheme({
  colorSchemes: {
    light: {
      palette: {
        background: {
          body: "#f7f8fa",
          surface: "#ffffff",
          level1: "#f5f5f5",
        },
        neutral: {
          softBg: "#f1f3f5",
        },
      },
    },
  },
  radius: {
    sm: "8px",
    md: "12px",
    lg: "18px",
  },
  fontFamily: {
    display: "Inter, sans-serif",
    body: "Inter, sans-serif",
  },
});

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState("login");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing authentication on app start
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("authToken");
      const userData = localStorage.getItem("user");
      if (token && userData) {
        try {
          await authAPI.verifyToken();
          setUser(JSON.parse(userData));
          setIsAuthenticated(true);
          setCurrentView("dashboard");
        } catch {
          localStorage.clear();
          setIsAuthenticated(false);
          setCurrentView("login");
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    setCurrentView("dashboard");
  };

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    setIsAuthenticated(false);
    setCurrentView("login");
  };

  const handleNavigation = (view) => setCurrentView(view);

  if (loading) {
    return (
      <CssVarsProvider theme={theme}>
        <CssBaseline />
        <Box
          sx={{
            display: "flex",
            height: "100vh",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "lg",
          }}
        >
          <Typography level="title-md" color="neutral">
            Loading...
          </Typography>
        </Box>
      </CssVarsProvider>
    );
  }

  return (
    <CssVarsProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: "100vh", bgcolor: "background.body" }}>
        {isAuthenticated && (
          <NavBar
            userName={user?.full_name || user?.username || "User"}
            onLogout={handleLogout}
            onNavigate={handleNavigation}
            currentView={currentView}
          />
        )}

        <main>
          {!isAuthenticated && currentView === "login" && (
            <LoginPage
              onLogin={handleLogin}
              onSwitchRegister={() => setCurrentView("register")}
              onPublicSearch={() => setCurrentView("status-check")}
              onStatusCheck={() => setCurrentView("status-check")}
            />
          )}

          {!isAuthenticated && currentView === "register" && (
            <Register
              onBack={() => setCurrentView("login")}
              onSwitchToLogin={() => setCurrentView("login")}
            />
          )}

          {!isAuthenticated && currentView === "status-check" && (
            <Box>
              <Box
                component="button"
                onClick={() => setCurrentView("login")}
                sx={{
                  m: 2,
                  px: 3,
                  py: 1,
                  borderRadius: "md",
                  border: "none",
                  bgcolor: "neutral.softBg",
                  cursor: "pointer",
                  "&:hover": { bgcolor: "neutral.plainHoverBg" },
                }}
              >
                ← Back to Login
              </Box>
              <LoanStatusCheck />
            </Box>
          )}

          {isAuthenticated && currentView === "dashboard" && (
            <Dashboard onNavigate={handleNavigation} />
          )}

          {isAuthenticated && currentView === "create-loan" && (
            <CreateLoan onBack={() => setCurrentView("dashboard")} />
          )}

          {isAuthenticated && currentView === "view-applications" && (
            <ViewApplications onBack={() => setCurrentView("dashboard")} />
          )}

          {isAuthenticated && currentView === "services" && (
            <Services onBack={() => setCurrentView("dashboard")} />
          )}

          {isAuthenticated && currentView === "private-search" && (
            <LoanSearch onBack={() => setCurrentView("dashboard")} />
          )}

          {isAuthenticated && currentView === "status-check" && (
            <LoanStatusCheck />
          )}

          {isAuthenticated && currentView === "loan-search" && (
            <LoanSearch onBack={() => setCurrentView("dashboard")} />
          )}
        </main>
      </Box>
    </CssVarsProvider>
  );
}

export default App;
