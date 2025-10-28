import React, { useState, useEffect } from "react";
import { CssVarsProvider, extendTheme } from "@mui/joy/styles";
import CssBaseline from "@mui/joy/CssBaseline";
import Box from "@mui/joy/Box";
import Typography from "@mui/joy/Typography";

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "./components/LoginPage";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import CreateLoan from "./components/CreateLoan";
import ViewApplications from "./components/ViewLoans";
import Services from "./components/Services";
import LoanSearch from "./components/LoanSearch";
import LoanStatusCheck from "./components/LoanStatusCheck";
import UserManagement from "./components/UserManagement";
import SocietyBranchesManagement from "./components/SocietyBranchesManagement";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";

import NavBar from "./components/NavBar";
import { authAPI } from "./services/api";
import AdminContactMessages from "./pages/AdminContactMessages";

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
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("authToken");
      const userData = localStorage.getItem("user");

      if (token && userData) {
        try {
          await authAPI.verifyToken();
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          setIsAuthenticated(true);
        } catch {
          localStorage.clear();
          setIsAuthenticated(false);
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const handleLogin = (userData) => {
    if (userData && userData.role) localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    setIsAuthenticated(false);
  };

  if (loading) {
    return (
      <CssVarsProvider theme={theme}>
        <CssBaseline />
        <Box
          sx={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center" }}
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
      <Router>
        <Box sx={{ minHeight: "100vh", bgcolor: "background.body" }}>
          {isAuthenticated && (
            <NavBar
              userName={user?.full_name || user?.username || user?.name || "User"}
              userRole={user?.role || "user"}
              onLogout={handleLogout}
              currentView=""
            />
          )}

          <main>
            <Routes>
              {/* Public Routes */}
              <Route
                path="/login"
                element={
                  isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage onLogin={handleLogin} />
                }
              />
              <Route
                path="/register"
                element={isAuthenticated ? <Navigate to="/dashboard" /> : <Register />}
              />
              <Route path="/status-check" element={<LoanStatusCheck />} />
                <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/contact-messages" element={<AdminContactMessages />}/>
              {/* Private Routes */}
              {isAuthenticated && (
                <>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/create-loan" element={<CreateLoan />} />
                  <Route path="/view-loans" element={<ViewApplications />} />
                  <Route path="/services" element={<Services />} />
                  <Route path="/loan-search" element={<LoanSearch />} />
                  <Route path="/search" element={<LoanSearch />} />
                  <Route path="/admin-users" element={<UserManagement />} />
                  <Route path="/manage-banks" element={<SocietyBranchesManagement />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/contact-messages" element={<AdminContactMessages />}/>
                </>
              )}

              {/* Default redirect */}
              <Route
                path="*"
                element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />}
              />
            </Routes>
          </main>
        </Box>
      </Router>
    </CssVarsProvider>
  );
}

export default App;
