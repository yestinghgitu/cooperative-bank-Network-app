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
import { Menu, X } from "lucide-react"; //  lightweight icons
import logo from "../assets/logo_connected1.png"; //  ensure this exists

const NavBar = ({ userName, onLogout, onNavigate, currentView }) => {
  const [open, setOpen] = useState(false);

  const menuItems = [
    ["dashboard", "Dashboard"],
    ["create-loan", "Create Loan"],
    ["view-applications", "Applications"],
    ["services", "Services"],
    ["private-search", "Search"],
  ];

  const handleNavigate = (view) => {
    onNavigate(view);
    setOpen(false); // close drawer on selection
  };

  return (
    <>
      {/* TOP NAV BAR */}
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
          py: 2,
          boxShadow: "sm",
          backdropFilter: "blur(6px)",
          position: "sticky",
          top: 0,
          zIndex: 1200,
        }}
      >
        {/* Left: Logo + Title */}
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            component="img"
            src={logo}
            alt="Cooperative Bank Network Logo"
            sx={{
              width: 150,
              height: 60,
              borderRadius: "md",
              objectFit: "contain",
              filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.2))",
            }}
          />
          <Typography level="title-lg" color="primary" fontWeight="lg">
            Cooperative Bank Network
          </Typography>
        </Stack>

        {/* Desktop Buttons */}
        <Stack
          direction="row"
          spacing={1.2}
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
                px: 1.8,
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
            sx={{ fontWeight: 500, px: 2 }}
          >
            Logout
          </Button>
        </Stack>

        {/* Mobile Menu Button */}
        <IconButton
          variant="plain"
          color="neutral"
          onClick={() => setOpen(true)}
          sx={{ display: { xs: "flex", md: "none" } }}
        >
          <Menu />
        </IconButton>
      </Sheet>

      {/* MOBILE DRAWER */}
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
            <IconButton variant="plain" color="neutral" onClick={() => setOpen(false)}>
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
                  textAlign: "left",
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
