import React, { useState } from "react";
import { Sheet, Typography, Stack, Box, IconButton, Drawer, Divider, Tooltip, Button } from "@mui/joy";
import { Menu as MenuIcon, X, FileText, ArrowDownCircle } from "lucide-react";
import logo from "../assets/co_network.png";

// PDF file path: place your PDF in public/files/cooperative_banks.pdf
const NavBar = ({ userName, userRole, onLogout, onNavigate, currentView }) => {
  const [open, setOpen] = useState(false);

  const menuItems = [
    ["dashboard", "Home"],
    ["create-loan", "Create Loan"],
    ["view-applications", "Loans"],
    ["private-search", "Search"],
  ];

  if (userRole === "admin") menuItems.push(["admin-users", "User Management"]);

  const handleNavigate = (view) => {
    onNavigate(view);
    setOpen(false);
  };

  const handleViewPDF = () => {
    // Opens PDF in a new tab; users can download from browser
    window.open("/files/cooperative_banks.pdf", "_blank");
  };

  return (
    <>
      {/* NAVBAR */}
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
        <Stack direction="row" spacing={1.0} alignItems="center" sx={{ display: { xs: "none", md: "flex" } }}>
          {menuItems.map(([view, label]) => (
            <Button
              key={view}
              size="sm"
              variant={currentView === view ? "solid" : "plain"}
              color={currentView === view ? "primary" : "neutral"}
              onClick={() => handleNavigate(view)}
              sx={{ fontWeight: 500, px: 2, "&:hover": { transform: "scale(1.05)" } }}
            >
              {label}
            </Button>
          ))}

          {/* PDF icon with hover overlay */}
          <Tooltip title="Cooperative Banks Details" variant="soft" color="neutral">
            <Box
              sx={{
                position: "relative",
                ml: 1,
                "&:hover .overlayIcon": { opacity: 1 },
              }}
            >
              <IconButton
                variant="outlined"
                color="primary"
                onClick={handleViewPDF}
              >
                <FileText />
              </IconButton>
              <ArrowDownCircle
                className="overlayIcon"
                size={16}
                style={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  color: "#1976d2",
                  backgroundColor: "white",
                  borderRadius: "50%",
                  opacity: 0,
                  transition: "opacity 0.2s",
                }}
              />
            </Box>
          </Tooltip>

          <Button
            size="sm"
            variant="outlined"
            color="danger"
            onClick={onLogout}
            sx={{ fontWeight: 500, px: 2.5, "&:hover": { backgroundColor: "danger.softBg" } }}
          >
            Logout
          </Button>
        </Stack>

        {/* MOBILE MENU ICON */}
        <IconButton variant="plain" color="neutral" onClick={() => setOpen(true)} sx={{ display: { xs: "flex", md: "none" } }}>
          <MenuIcon />
        </IconButton>
      </Sheet>

      {/* MOBILE DRAWER */}
      <Drawer open={open} onClose={() => setOpen(false)} anchor="right" size="sm">
        <Box sx={{ p: 2 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
            <Typography level="title-md" fontWeight="lg" color="primary">Menu</Typography>
            <IconButton variant="plain" color="neutral" onClick={() => setOpen(false)}><X /></IconButton>
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
                sx={{ fontWeight: 500, justifyContent: "flex-start", py: 1.1 }}
              >
                {label}
              </Button>
            ))}

            {/* PDF icon for mobile */}
            <Tooltip title="Cooperative Banks Details" variant="soft" color="neutral">
              <Box
                sx={{
                  position: "relative",
                  "&:hover .overlayIcon": { opacity: 1 },
                  py: 1,
                }}
              >
                <IconButton
                  variant="soft"
                  color="primary"
                  onClick={handleViewPDF}
                  sx={{ justifyContent: "flex-start" }}
                >
                  <FileText />
                </IconButton>
                <ArrowDownCircle
                  className="overlayIcon"
                  size={16}
                  style={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    color: "#1976d2",
                    backgroundColor: "white",
                    borderRadius: "50%",
                    opacity: 0,
                    transition: "opacity 0.2s",
                  }}
                />
              </Box>
            </Tooltip>

            <Divider sx={{ my: 1 }} />
            <Button fullWidth variant="outlined" color="danger" onClick={onLogout} sx={{ fontWeight: 500 }}>
              Logout
            </Button>
          </Stack>
        </Box>
      </Drawer>
    </>
  );
};

export default NavBar;
