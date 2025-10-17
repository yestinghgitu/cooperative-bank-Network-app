import React from "react";
import ReactDOM from "react-dom/client";
import { CssVarsProvider, useColorScheme } from "@mui/joy/styles";
import CssBaseline from "@mui/joy/CssBaseline";
import { Toaster } from "sonner";
import App from "./App";

/**
 * Custom wrapper so Sonner follows Joy UI’s current color scheme.
 */
function ThemedToaster() {
  const { mode } = useColorScheme(); // "light" or "dark"
  return (
    <Toaster
      position="top-right"
      richColors
      closeButton
      expand
      theme={mode === "dark" ? "dark" : "light"}
      toastOptions={{
        style: {
          fontFamily: "inherit",
          borderRadius: "10px",
          padding: "12px 16px",
          fontSize: "0.95rem",
        },
      }}
    />
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <CssVarsProvider>
      <CssBaseline />
      <App />
      {/* ✅ Sonner now auto-syncs with Joy UI color mode */}
      <ThemedToaster />
    </CssVarsProvider>
  </React.StrictMode>
);
