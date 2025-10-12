// src/theme.js
import { extendTheme } from "@mui/joy/styles";

const theme = extendTheme({
  colorSchemes: {
    light: {
      palette: {
        primary: {
          solidBg: "#2563eb",
          solidHoverBg: "#1d4ed8",
          softBg: "#eff6ff",
          softColor: "#1e3a8a",
        },
        neutral: {
          solidBg: "#f3f4f6",
          softBg: "#f9fafb",
          softColor: "#374151",
        },
        background: {
          body: "#f8fafc",
          surface: "#ffffff",
          level1: "#f1f5f9",
          level2: "#e2e8f0",
        },
      },
    },
  },
  fontFamily: {
    display: "'Inter', system-ui, sans-serif",
    body: "'Inter', system-ui, sans-serif",
  },
  radius: {
    sm: "8px",
    md: "12px",
    lg: "16px",
  },
  shadow: {
    sm: "0 1px 3px rgba(0,0,0,0.06)",
    md: "0 4px 6px rgba(0,0,0,0.08)",
    lg: "0 10px 15px rgba(0,0,0,0.1)",
  },
  components: {
    JoyCard: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: theme.radius.lg,
          boxShadow: theme.shadow.sm,
          backgroundColor: theme.vars.palette.background.surface,
          transition: "all 0.25s ease",
          "&:hover": {
            boxShadow: theme.shadow.md,
            transform: "translateY(-2px)",
          },
        }),
      },
    },
    JoyButton: {
      defaultProps: { variant: "soft", color: "primary" },
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: theme.radius.md,
          fontWeight: 600,
          textTransform: "none",
          "&:hover": { filter: "brightness(0.95)" },
        }),
      },
    },
    JoyInput: {
      defaultProps: { variant: "soft" },
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: theme.radius.md,
          backgroundColor: theme.vars.palette.background.level1,
          "&:focus-within": {
            boxShadow: `0 0 0 2px ${theme.vars.palette.primary.softBg}`,
          },
        }),
      },
    },
  },
});

export default theme;
