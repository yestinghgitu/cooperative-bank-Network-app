import React from "react";
import { Sheet, Typography, Box, Stack, Link, Divider } from "@mui/joy";
import { Banknote, Linkedin, Twitter, Facebook } from "lucide-react";

const Footer = () => {
  return (
    <Sheet
      variant="soft"
      color="neutral"
      sx={{
        mt: 6,
        py: 3,
        borderRadius: "12px 12px 0 0",
        boxShadow: "sm",
        backdropFilter: "blur(6px)",
      }}
    >
      {/* Upper Section */}
      <Stack
        direction={{ xs: "column", md: "row" }}
        alignItems={{ xs: "flex-start", md: "center" }}
        justifyContent="space-between"
        spacing={2}
        sx={{ px: { xs: 2, md: 4 } }}
      >
        {/* Left: Brand */}
        <Stack direction="row" alignItems="center" spacing={1}>
          <Banknote size={24} color="var(--joy-palette-primary-500)" />
          <Typography
            level="title-lg"
            color="primary"
            fontWeight="lg"
            sx={{ whiteSpace: "nowrap" }}
          >
            Cooperative Bank Network
          </Typography>
        </Stack>

        {/* Center: Links */}
        <Stack
          direction="row"
          spacing={3}
          sx={{
            flexWrap: "wrap",
            justifyContent: { xs: "flex-start", md: "center" },
            fontSize: "0.9rem",
          }}
        >
          <Link
            href="#"
            level="body-sm"
            color="neutral"
            sx={{
              "&:hover": { color: "primary.plainColor", textDecoration: "none" },
            }}
          >
            About Us
          </Link>
          <Link
            href="#"
            level="body-sm"
            color="neutral"
            sx={{
              "&:hover": { color: "primary.plainColor", textDecoration: "none" },
            }}
          >
            Contact
          </Link>
          <Link
            href="#"
            level="body-sm"
            color="neutral"
            sx={{
              "&:hover": { color: "primary.plainColor", textDecoration: "none" },
            }}
          >
            Privacy Policy
          </Link>
        </Stack>

        {/* Right: Social Icons */}
        <Stack direction="row" spacing={1.5}>
          <Link href="#" aria-label="LinkedIn">
            <Linkedin size={20} />
          </Link>
          <Link href="#" aria-label="Twitter">
            <Twitter size={20} />
          </Link>
          <Link href="#" aria-label="Facebook">
            <Facebook size={20} />
          </Link>
        </Stack>
      </Stack>

      {/* Divider */}
      <Divider sx={{ my: 2, opacity: 0.6 }} />

      {/* Bottom Section */}
      <Box textAlign="center" px={2}>
        <Typography level="body-sm" color="neutral">
          © {new Date().getFullYear()} Cooperative Bank Network. All rights
          reserved.
        </Typography>
        <Typography level="body-xs" color="neutral" sx={{ mt: 0.5 }}>
          Empowering Co-operative Banks through a unified digital ecosystem.
        </Typography>
      </Box>
    </Sheet>
  );
};

export default Footer;
