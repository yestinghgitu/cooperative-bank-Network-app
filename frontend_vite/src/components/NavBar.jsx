import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Sheet,
  Typography,
  Stack,
  Box,
  Button,
  Tooltip,
  IconButton,
  Menu,
  MenuItem,
  Link as JoyLink,
  Grid,
  Card,
} from "@mui/joy";
import {
  FileText,
  ArrowDownCircle,
  Banknote,
  Linkedin,
  Twitter,
  Facebook,
  LogOut,
  Settings,
  UserCog,
  Building,
  MessageSquare,
  Menu as LucideMenu,
  X,
} from "lucide-react";
import logo from "../assets/conetx_logo_new.png";

const NavBar = ({ userName, userRole, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname.replace("/", "");

  const menuItems = [
    ["dashboard", "Home"],
    ["create-loan", "Create Loan"],
    ["view-loans", "Loans"],
    ["loan-search", "Search"],
    ["credit-check", "Credit Score"],
  ];

  const adminTools = [
    {
      view: "admin-users",
      label: "User Management",
      desc: "Manage users, roles, and permissions",
      icon: <UserCog size={22} color="#1976d2" />,
    },
    {
      view: "manage-banks",
      label: "Society & Branch",
      desc: "Handle society and branch settings",
      icon: <Building size={22} color="#2e7d32" />,
    },
    {
      view: "contact-messages",
      label: "Contact Messages",
      desc: "Review and reply to inquiries",
      icon: <MessageSquare size={22} color="#d32f2f" />,
    },
  ];

  if (userRole === "manager") {
    menuItems.push(["admin-users", "User Management"]);
  }

  const [anchorEl, setAnchorEl] = useState(null);
  const [footerVisible, setFooterVisible] = useState(true);
  const [navVisible, setNavVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [adminPanelOpen, setAdminPanelOpen] = useState(false);

  const adminPanelRef = useRef(null);

  // hide both menus when clicking outside (works on mobile too)
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        adminPanelRef.current &&
        !adminPanelRef.current.contains(event.target)
      ) {
        setAdminPanelOpen(false);
      }
      if (anchorEl && !event.target.closest(".mobile-menu")) {
        setAnchorEl(null);
      }
    };
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, [anchorEl]);

  // hide navbar/footer on scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollingDown = currentScrollY > lastScrollY;
      const nearTop = currentScrollY < 50;
      setNavVisible(!scrollingDown || nearTop);
      setFooterVisible(!scrollingDown || nearTop);
      setLastScrollY(currentScrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const handleNavigate = (view) => {
    navigate(`/${view}`);
    setAnchorEl(null);
    setAdminPanelOpen(false);
  };

  const handleViewPDF = () => window.open("/files/cooperative_banks.pdf", "_blank");

  return (
    <>
      {/* NAVBAR */}
      <Sheet
        variant="soft"
        color="neutral"
        sx={{
          borderRadius: "0 0 12px 12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: { xs: 2, md: 3 },
          py: 1.6,
          boxShadow: "sm",
          backdropFilter: "blur(8px)",
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1200,
          opacity: navVisible ? 1 : 0,
          transform: navVisible ? "translateY(0)" : "translateY(-15px)",
          transition: "opacity 0.6s ease, transform 0.5s ease",
          backgroundColor: "rgba(255, 255, 255, 0.75)",
        }}
      >
{/* Logo */}
<Stack direction="row" alignItems="center" spacing={1}>
  <Box
    onClick={() => navigate("/dashboard")}
    sx={{
      height: "60px",
      width: "120px",
      display: "flex",
      alignItems: "center",
      overflow: "visible",
      cursor: "pointer",
    }}
  >
    <Box
      component="img"
      src={logo}
      alt="CoNetX Logo"
      sx={{
        height: "100%",
        width: "auto",
        objectFit: "contain",
        transform: "scale(1.6)",
        transformOrigin: "left center",
        transition: "transform 0.3s ease",
        filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.1))",
        "&:hover": {
          transform: "scale(1.7)",
        },
      }}
    />
  </Box>
</Stack>


        {/* Menu Section */}
        <Stack direction="row" spacing={1} alignItems="center">
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

            {/* Admin Tools Floating Panel */}
            {userRole === "admin" && (
              <Box sx={{ position: "relative" }} ref={adminPanelRef}>
                <Button
                  size="sm"
                  variant="soft"
                  color="primary"
                  startDecorator={<Settings size={16} />}
                  onClick={() => setAdminPanelOpen(!adminPanelOpen)}
                  sx={{
                    textTransform: "none",
                    borderRadius: "8px",
                    fontWeight: 600,
                    px: 2,
                  }}
                >
                  Admin Tools
                </Button>

                {adminPanelOpen && (
                  <Card
                    variant="outlined"
                    sx={{
                      position: "absolute",
                      top: "42px",
                      right: 0,
                      width: 320,
                      p: 2,
                      boxShadow: "lg",
                      borderRadius: "md",
                      backdropFilter: "blur(10px)",
                      backgroundColor: "rgba(255, 255, 255, 0.9)",
                      zIndex: 1300,
                      animation: "fadeIn 0.3s ease",
                      "@keyframes fadeIn": {
                        from: { opacity: 0, transform: "translateY(-8px)" },
                        to: { opacity: 1, transform: "translateY(0)" },
                      },
                    }}
                  >
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                      mb={1}
                    >
                      <Typography level="title-sm" fontWeight="lg">
                        Admin Control Panel
                      </Typography>
                      <IconButton
                        size="sm"
                        color="neutral"
                        variant="plain"
                        onClick={() => setAdminPanelOpen(false)}
                      >
                        <X size={16} />
                      </IconButton>
                    </Stack>

                    <Grid container spacing={1}>
                      {adminTools.map((item) => (
                        <Grid xs={12} key={item.view}>
                          <Box
                            onClick={() => handleNavigate(item.view)}
                            sx={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: 1,
                              p: 1,
                              borderRadius: "md",
                              cursor: "pointer",
                              "&:hover": {
                                backgroundColor: "primary.softBg",
                                transform: "scale(1.02)",
                                transition: "all 0.2s ease",
                              },
                            }}
                          >
                            {item.icon}
                            <Box>
                              <Typography level="body-sm" fontWeight="600">
                                {item.label}
                              </Typography>
                              <Typography
                                level="body-xs"
                                sx={{ color: "text.tertiary" }}
                              >
                                {item.desc}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </Card>
                )}
              </Box>
            )}
          </Stack>

          {/* Mobile Menu */}
          <Box sx={{ display: { xs: "block", sm: "none" } }}>
            <IconButton
              className="mobile-menu"
              onClick={(e) => {
                e.stopPropagation();
                setAnchorEl(anchorEl ? null : e.currentTarget);
              }}
            >
              <LucideMenu />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
              placement="bottom-end"
              sx={{
                minWidth: 200,
                "& [data-last-child]": { display: "block" }, // prevent prop injection to Fragment
              }}
            >
              {menuItems.map(([view, label]) => (
                <MenuItem key={view} onClick={() => handleNavigate(view)}>
                  {label}
                </MenuItem>
              ))}
              {userRole === "admin" && (
                <>
                  <MenuItem disabled sx={{ fontWeight: 600 }}>
                    Admin Tools
                  </MenuItem>
                  {adminTools.map((item) => (
                    <MenuItem
                      key={item.view}
                      onClick={() => handleNavigate(item.view)}
                    >
                      {item.label}
                    </MenuItem>
                  ))}
                </>
              )}
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
                style={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  color: "#1976d2",
                }}
              />
            </Box>
          </Tooltip>

          {/* Logout */}
          <Tooltip title="Logout">
            <Button
              color="danger"
              variant="outlined"
              onClick={onLogout}
              startDecorator={<LogOut size={16} />}
              sx={{
                fontWeight: 500,
                px: { xs: 1.5, sm: 2 },
                textTransform: "none",
              }}
            >
              <Box sx={{ display: { xs: "none", md: "inline" } }}>
                Logout ({userName})
              </Box>
            </Button>
          </Tooltip>
        </Stack>
      </Sheet>

      <Box sx={{ height: "70px" }} />

      {/* FOOTER */}
      <Sheet
        variant="soft"
        sx={{
          py: 1,
          px: { xs: 2, md: 4 },
          borderRadius: "12px 12px 0 0",
          boxShadow: "sm",
          backdropFilter: "blur(10px)",
          backgroundColor: "rgba(255, 255, 255, 0.7)",
          color: "text.primary",
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1100,
          opacity: footerVisible ? 1 : 0,
          transform: footerVisible ? "translateY(0)" : "translateY(10px)",
          transition: "opacity 0.6s ease, transform 0.5s ease",
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ flexWrap: "wrap", gap: 1 }}
        >
          <Stack direction="row" alignItems="center" spacing={0.8}>
            <Banknote size={18} color="var(--joy-palette-primary-500)" />
            <Typography level="body-sm" fontWeight="lg">
              CoNetX © {new Date().getFullYear()}
            </Typography>
          </Stack>

          <Stack direction="row" spacing={2} sx={{ flexWrap: "wrap" }}>
            {[
              ["about", "About"],
              ["terms", "Terms"],
              ["privacy", "Privacy"],
              ["contact", "Contact"],
            ].map(([path, label]) => (
              <JoyLink
                key={path}
                component="button"
                onClick={() => navigate(`/${path}`)}
                level="body-xs"
                underline="none"
                sx={{
                  color: "neutral.700",
                  "&:hover": { color: "primary.solidBg" },
                }}
              >
                {label}
              </JoyLink>
            ))}
          </Stack>

          <Stack direction="row" spacing={1}>
            {[Linkedin, Twitter, Facebook].map((Icon, i) => (
              <IconButton
                key={i}
                size="sm"
                variant="plain"
                color="neutral"
                aria-label={Icon.name}
                sx={{
                  "&:hover": {
                    color: "primary.solidBg",
                    transform: "scale(1.1)",
                    transition: "all 0.2s ease",
                  },
                }}
              >
                <Icon size={16} />
              </IconButton>
            ))}
          </Stack>
        </Stack>
      </Sheet>

      <Box sx={{ height: "60px" }} />
    </>
  );
};

export default NavBar;
