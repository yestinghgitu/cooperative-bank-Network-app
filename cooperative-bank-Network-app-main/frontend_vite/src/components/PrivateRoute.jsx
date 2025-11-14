import React from "react";
import { Navigate } from "react-router-dom";

/**
 * PrivateRoute Component
 * Redirects to /login if user is not authenticated
 */
const PrivateRoute = ({ isAuthenticated, children }) => {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default PrivateRoute;
