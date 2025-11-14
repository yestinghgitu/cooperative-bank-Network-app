import React from "react";
import { Box, Stack, Link, Divider, Typography } from "@mui/joy";
import { useNavigate } from "react-router-dom";

const AuthFooter = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        mt: 4,
        textAlign: "center",
        color: "text.tertiary",
        animation: "fadeIn 0.5s ease-in-out",
        "@keyframes fadeIn": {
          from: { opacity: 0, transform: "translateY(10px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
      }}
    >
      <Divider sx={{ mb: 2, opacity: 0.4 }} />

      <Stack
        direction="row"
        justifyContent="center"
        alignItems="center"
        spacing={3}
        sx={{
          mb: 1,
          flexWrap: "wrap",
          "& a": {
            color: "primary.plainColor",
            fontWeight: 500,
            cursor: "pointer",
            transition: "color 0.2s ease",
            "&:hover": { color: "primary.solidBg" },
          },
        }}
      >
        <Link onClick={() => navigate("/terms")}>Terms & Conditions</Link>
        <Link onClick={() => navigate("/privacy")}>Privacy Policy</Link>
        <Link onClick={() => navigate("/contact")}>Contact Us</Link>
      </Stack>

      <Typography level="body-xs" sx={{ color: "text.tertiary" }}>
        © {new Date().getFullYear()} CoNetX. All rights reserved.
      </Typography>
    </Box>
  );
};

export default AuthFooter;
