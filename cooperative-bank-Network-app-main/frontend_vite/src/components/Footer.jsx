import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Sheet,
  Typography,
  Box,
  Stack,
  Link as JoyLink,
  Divider,
  IconButton,
} from "@mui/joy";
import { Banknote, Linkedin, Twitter, Facebook } from "lucide-react";

const Footer = () => {
  const navigate = useNavigate();

  return (
    <Sheet
      variant="soft"
      sx={{
        mt: 6,
        py: { xs: 4, md: 5 },
        borderRadius: "16px 16px 0 0",
        boxShadow: "sm",
        backdropFilter: "blur(12px)",
        background: {
          xs: "linear-gradient(145deg, var(--joy-palette-neutral-50), var(--joy-palette-background-surface))",
          md: "linear-gradient(145deg, var(--joy-palette-primary-50), var(--joy-palette-background-body))",
        },
        color: "text.primary",
      }}
    >
      {/* ========== Upper Section ========== */}
      <Stack
        direction={{ xs: "column", md: "row" }}
        alignItems={{ xs: "flex-start", md: "center" }}
        justifyContent="space-between"
        spacing={3}
        sx={{ px: { xs: 2, md: 5 } }}
      >
        {/* ---- Left: Brand ---- */}
        <Stack direction="row" alignItems="center" spacing={1}>
          <Banknote size={26} color="var(--joy-palette-primary-500)" />
          <Typography
            level="title-lg"
            fontWeight="lg"
            sx={{
              whiteSpace: "nowrap",
              color: "primary.plainColor",
            }}
          >
            CoNetX
          </Typography>
        </Stack>

        {/* ---- Center: Navigation Links ---- */}
        <Stack
          direction="row"
          spacing={3}
          sx={{
            flexWrap: "wrap",
            justifyContent: { xs: "flex-start", md: "center" },
            fontSize: "0.9rem",
          }}
        >
          <JoyLink
            component="button"
            onClick={() => navigate("/about")}
            level="body-sm"
            sx={{
              "&:hover": { color: "primary.plainColor", textDecoration: "none" },
            }}
          >
            About Us
          </JoyLink>
          <JoyLink
            component="button"
            onClick={() => navigate("/contact")}
            level="body-sm"
            sx={{
              "&:hover": { color: "primary.plainColor", textDecoration: "none" },
            }}
          >
            Contact
          </JoyLink>
          <JoyLink
            component="button"
            onClick={() => navigate("/legal")}
            level="body-sm"
            sx={{
              "&:hover": { color: "primary.plainColor", textDecoration: "none" },
            }}
          >
            Terms & Conditions
          </JoyLink>
          <JoyLink
            component="button"
            onClick={() => navigate("/privacy")}
            level="body-sm"
            sx={{
              "&:hover": { color: "primary.plainColor", textDecoration: "none" },
            }}
          >
            Privacy Policy
          </JoyLink>
        </Stack>

        {/* ---- Right: Social Links ---- */}
        <Stack direction="row" spacing={1.5}>
          {[
            { icon: Linkedin, label: "LinkedIn", href: "#" },
            { icon: Twitter, label: "Twitter", href: "#" },
            { icon: Facebook, label: "Facebook", href: "#" },
          ].map(({ icon: Icon, label, href }, i) => (
            <IconButton
              key={i}
              variant="plain"
              color="neutral"
              component="a"
              href={href}
              aria-label={label}
              sx={{
                "&:hover": {
                  color: "primary.solidBg",
                  transform: "scale(1.1)",
                  transition: "all 0.2s ease",
                },
              }}
            >
              <Icon size={20} />
            </IconButton>
          ))}
        </Stack>
      </Stack>

      {/* ========== Divider ========== */}
      <Divider sx={{ my: 3, opacity: 0.6 }} />

      {/* ========== Bottom Section ========== */}
      <Box textAlign="center" px={2}>
        <Typography level="body-sm" sx={{ color: "text.secondary" }}>
          © {new Date().getFullYear()}{" "}
          <strong>CoNetX</strong>. All rights reserved.
        </Typography>
        <Typography
          level="body-xs"
          sx={{
            mt: 0.5,
            color: "text.tertiary",
            maxWidth: 600,
            mx: "auto",
          }}
        >
          Empowering Cooperative Banks through secure, transparent, and
          collaborative digital lending.
        </Typography>
      </Box>
    </Sheet>
  );
};

export default Footer;
