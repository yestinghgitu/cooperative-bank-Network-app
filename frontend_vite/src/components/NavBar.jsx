import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Sheet, Typography, Stack, Box, Button, Tooltip, IconButton, Menu, MenuItem } from "@mui/joy";
import { FileText, ArrowDownCircle, Menu as MenuIcon } from "lucide-react";
import logo from "../assets/co_network.png";

const NavBar = ({ userName, userRole, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname.replace("/", ""); // get current path without leading /

  const menuItems = [
    ["dashboard", "Home"],
    ["create-loan", "Create Loan"],
    ["view-loans", "Loans"],
    ["search", "Search"],
  ];

  if (userRole === "admin" || userRole === "manager") {
    menuItems.push(["admin-users", "User Management"]);
  }

  if (userRole === "admin") {
    menuItems.push(["manage-banks", "Society & Branch"]);
  }

  const [anchorEl, setAnchorEl] = useState(null);

  const handleNavigate = (view) => {
    navigate(`/${view}`);
    setAnchorEl(null);
  };

  const handleViewPDF = () => {
    window.open("/files/cooperative_banks.pdf", "_blank");
  };

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  return (
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
      {/* Logo and Title */}
      <Stack direction="row" alignItems="center" spacing={1.0}>
        <Box
          component="img"
          src={logo}
          alt="Cooperative Bank Network Logo"
          sx={{ width: { xs: 40, sm: 50, md: 80 }, height: "auto", objectFit: "contain" }}
        />
        <Typography
          level="title-lg"
          color="primary"
          fontWeight="lg"
          sx={{
            fontSize: { xs: "1rem", sm: "1.1rem", md: "1.25rem" },
            ml: 1,
            whiteSpace: "nowrap",
          }}
        >
          <Box component="span" sx={{ display: { xs: "inline", sm: "none" } }}>CBN</Box>
          <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>Cooperative Bank Network</Box>
        </Typography>
      </Stack>

      {/* Menu & Actions */}
      <Stack direction="row" spacing={1.0} alignItems="center">
        {/* Desktop Menu */}
        <Stack direction="row" spacing={1} sx={{ display: { xs: "none", sm: "flex" } }}>
          {menuItems.map(([view, label]) => {
            const isActive = currentPath === view;
            return (
              <Button
                key={view}
                size="sm"
                variant={isActive ? "solid" : "plain"}
                color={isActive ? "primary" : "neutral"}
                onClick={() => handleNavigate(view)}
                sx={{
                  fontWeight: isActive ? 600 : 500,
                  px: 2,
                  borderRadius: "8px",
                  textTransform: "none",
                }}
              >
                {label}
              </Button>
            );
          })}
        </Stack>

        {/* Mobile Menu */}
        <Box sx={{ display: { xs: "block", sm: "none" } }}>
          <IconButton onClick={handleMenuOpen}>
            <MenuIcon />
          </IconButton>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
            {menuItems.map(([view, label]) => {
              const isActive = currentPath === view;
              return (
                <MenuItem
                  key={view}
                  onClick={() => handleNavigate(view)}
                  sx={{
                    fontWeight: isActive ? 600 : 500,
                    backgroundColor: isActive ? "rgba(25, 118, 210, 0.08)" : "transparent",
                  }}
                >
                  {label}
                </MenuItem>
              );
            })}
          </Menu>
        </Box>

        {/* PDF Button */}
        <Tooltip title="Cooperative Banks Details">
          <Box sx={{ position: "relative", ml: 1 }}>
            <IconButton variant="outlined" color="primary" onClick={handleViewPDF}>
              <FileText />
            </IconButton>
            <ArrowDownCircle
              size={16}
              style={{ position: "absolute", bottom: 0, right: 0, color: "#1976d2" }}
            />
          </Box>
        </Tooltip>

        {/* Logout */}
        <Button
          color="danger"
          variant="outlined"
          onClick={onLogout}
          sx={{ fontWeight: 500, px: { xs: 1.5, sm: 2.5 } }}
        >
          Logout ({userName})
        </Button>
      </Stack>
    </Sheet>
  );
};

export default NavBar;
