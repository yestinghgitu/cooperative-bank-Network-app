import React, { useState, useEffect } from "react";
import { CssVarsProvider, extendTheme } from "@mui/joy/styles";
import CssBaseline from "@mui/joy/CssBaseline";
import Box from "@mui/joy/Box";
import Typography from "@mui/joy/Typography";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";

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
import AdminContactMessages from "./pages/AdminContactMessages";
import NavBar from "./components/NavBar";
import { authAPI } from "./services/api";
import PrivateRoute from "./components/PrivateRoute";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import CreditCheck from "./components/CreditCheck";

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

function AppWrapper() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
      } else {
        setIsAuthenticated(false);
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
    navigate("/login", { replace: true });
  };

  if (loading) {
    return (
      <Box
        sx={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center" }}
      >
        <Typography level="title-md" color="neutral">
          Loading...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.body" }}>
      {/* NavBar always shows when logged in */}
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
          {/* ---------- PUBLIC ROUTES ---------- */}
          <Route
            path="/login"
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" />
              ) : (
                <LoginPage onLogin={handleLogin} />
              )
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
          
          {/* ---------- PROTECTED ROUTES ---------- */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute isAuthenticated={isAuthenticated}>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/create-loan"
            element={
              <PrivateRoute isAuthenticated={isAuthenticated}>
                <CreateLoan />
              </PrivateRoute>
            }
          />
          <Route
            path="/view-loans"
            element={
              <PrivateRoute isAuthenticated={isAuthenticated}>
                <ViewApplications />
              </PrivateRoute>
            }
          />
          <Route
            path="/services"
            element={
              <PrivateRoute isAuthenticated={isAuthenticated}>
                <Services />
              </PrivateRoute>
            }
          />
          <Route
            path="/loan-search"
            element={
              <PrivateRoute isAuthenticated={isAuthenticated}>
                <LoanSearch />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin-users"
            element={
              <PrivateRoute isAuthenticated={isAuthenticated}>
                <UserManagement />
              </PrivateRoute>
            }
          />
          <Route
            path="/manage-banks"
            element={
              <PrivateRoute isAuthenticated={isAuthenticated}>
                <SocietyBranchesManagement />
              </PrivateRoute>
            }
          />
          <Route
            path="/contact-messages"
            element={
              <PrivateRoute isAuthenticated={isAuthenticated}>
                <AdminContactMessages />
              </PrivateRoute>
            }
          />
          <Route
  path="/credit-check"
  element={
    <PrivateRoute isAuthenticated={isAuthenticated}>
      <CreditCheck />
    </PrivateRoute>
  }
/>

          {/* ---------- DEFAULT REDIRECT ---------- */}
          <Route
            path="*"
            element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />}
          />

         {/* ----------For password reset ---------- */}
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        </Routes>
      </main>
    </Box>
  );
}

export default function App() {
  return (
    <CssVarsProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AppWrapper />
      </Router>
    </CssVarsProvider>
  );
}
