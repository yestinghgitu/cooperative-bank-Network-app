import React from "react";
import { Box, Typography, Sheet, Divider } from "@mui/joy";

const About = () => {
  return (
    <Box sx={{ maxWidth: 1000, mx: "auto", my: 6, px: 3 }}>
      <Sheet
        variant="outlined"
        sx={{
          p: { xs: 3, md: 5 },
          borderRadius: "lg",
          boxShadow: "md",
          bgcolor: "background.body",
        }}
      >
        <Typography
          level="h3"
          textAlign="center"
          sx={{ color: "primary.plainColor", mb: 1 }}
        >
          About CoNetX
        </Typography>
        <Typography
          level="body-sm"
          textAlign="center"
          sx={{ mb: 4, color: "text.tertiary" }}
        >
          Empowering cooperative banks through a unified digital ecosystem.
        </Typography>

        <Typography level="body-md" sx={{ mb: 2 }}>
          The CoNetX is an initiative designed to empower
          cooperative banks, credit societies, and financial institutions
          through secure data sharing and loan verification. Our goal is to
          prevent borrower fraud, streamline inter-bank collaboration, and
          enhance the transparency of lending operations.
        </Typography>

        <Typography level="body-md" sx={{ mb: 2 }}>
          By connecting financial cooperatives under one digital platform, we
          help institutions verify loan obligations, identify risk, and promote
          responsible lending practices.
        </Typography>

        <Divider sx={{ my: 3 }} />

        <Typography level="h5" sx={{ mb: 1 }}>
          Our Vision
        </Typography>
        <Typography level="body-md">
          To build a trusted, interconnected financial community that supports
          cooperative growth, transparency, and inclusive banking.
        </Typography>
      </Sheet>
    </Box>
  );
};

export default About;
