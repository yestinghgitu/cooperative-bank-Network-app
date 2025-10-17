import React, { useState } from "react";
import {
  Sheet,
  Typography,
  Button,
  Stack,
  Box,
  IconButton,
  Drawer,
  Divider,
} from "@mui/joy";
import { Menu, X } from "lucide-react";
import logo from "../assets/co_network.png"; // ✅ Ensure correct path

const NavBar = ({ userName, onLogout, onNavigate, currentView }) => {
  const [open, setOpen] = useState(false);

  const menuItems = [
    ["dashboard", "Dashboard"],
    ["create-loan", "Create Loan"],
    ["view-applications", "Loans"],
    ["private-search", "Search"],
    ["services", "Services"],
  ];

  const handleNavigate = (view) => {
    onNavigate(view);
    setOpen(false);
  };

  return (
    <>
      {/* 🌟 TOP NAV BAR */}
      <Sheet
        variant="soft"
        color="neutral"
        sx={{
          mb: 3,
          borderRadius: "0 0 12px 12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: { xs: 2, md: 3 },
          py: 1.6,
          boxShadow: "sm",
          backdropFilter: "blur(6px)",
          position: "sticky",
          top: 0,
          zIndex: 1200,
        }}
      >
        {/* LEFT: Logo + Title */}
        <Stack direction="row" alignItems="center" spacing={1.0}>
          <Box
            component="img"
            src={logo}
            alt="Cooperative Bank Network Logo"
            sx={{
              width: { xs: 50, sm: 50, md: 80 }, 
              height: "auto",
              objectFit: "contain",
              filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.25))",
              transition: "0.3s ease",
            }}
          />

          {/* Optional Title (hidden on small screens) */}
          <Typography
            level="title-lg"
            color="primary"
            fontWeight="lg"
            sx={{
              fontSize: { xs: "1rem", sm: "1.1rem", md: "1.25rem" },
              display: { xs: "none", lg: "block" },
              ml: 1,
              whiteSpace: "nowrap",
            }}
          >
            Cooperative Bank Network
          </Typography>
        </Stack>

        {/* DESKTOP MENU */}
        <Stack
          direction="row"
          spacing={1.0}
          alignItems="center"
          sx={{ display: { xs: "none", md: "flex" } }}
        >
          {menuItems.map(([view, label]) => (
            <Button
              key={view}
              size="sm"
              variant={currentView === view ? "solid" : "plain"}
              color={currentView === view ? "primary" : "neutral"}
              onClick={() => handleNavigate(view)}
              sx={{
                fontWeight: 500,
                px: 2,
                "&:hover": { transform: "scale(1.05)" },
              }}
            >
              {label}
            </Button>
          ))}

          <Button
            size="sm"
            variant="outlined"
            color="danger"
            onClick={onLogout}
            sx={{
              fontWeight: 500,
              px: 2.5,
              "&:hover": { backgroundColor: "danger.softBg" },
            }}
          >
            Logout
          </Button>
        </Stack>

        {/* MOBILE MENU BUTTON */}
        <IconButton
          variant="plain"
          color="neutral"
          onClick={() => setOpen(true)}
          sx={{ display: { xs: "flex", md: "none" } }}
        >
          <Menu />
        </IconButton>
      </Sheet>

      {/* 📱 MOBILE DRAWER */}
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        anchor="right"
        size="sm"
        sx={{ display: { xs: "block", md: "none" } }}
      >
        <Box sx={{ p: 2 }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            mb={2}
          >
            <Typography level="title-md" fontWeight="lg" color="primary">
              Menu
            </Typography>
            <IconButton
              variant="plain"
              color="neutral"
              onClick={() => setOpen(false)}
            >
              <X />
            </IconButton>
          </Stack>

          <Divider sx={{ mb: 1 }} />

          <Stack spacing={1.2}>
            {menuItems.map(([view, label]) => (
              <Button
                key={view}
                fullWidth
                variant={currentView === view ? "solid" : "soft"}
                color={currentView === view ? "primary" : "neutral"}
                onClick={() => handleNavigate(view)}
                sx={{
                  fontWeight: 500,
                  justifyContent: "flex-start",
                  py: 1.1,
                }}
              >
                {label}
              </Button>
            ))}
            <Divider sx={{ my: 1 }} />
            <Button
              fullWidth
              variant="outlined"
              color="danger"
              onClick={onLogout}
              sx={{ fontWeight: 500 }}
            >
              Logout
            </Button>
          </Stack>
        </Box>
      </Drawer>
    </>
  );
};

export default NavBar;
