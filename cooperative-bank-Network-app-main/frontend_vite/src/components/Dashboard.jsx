// src/components/Dashboard.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  Typography,
  Grid,
  Divider,
  CircularProgress,
  Stack,
  Button,
  Tooltip,
  Chip,
} from "@mui/joy";
import { motion, AnimatePresence } from "framer-motion";
import {
  AccountBalance,
  Assignment,
  AddCircleOutline,
  Search,
  Groups,
  AccountTree,
} from "@mui/icons-material";
import {
  UserPlus,
  ClipboardCheck,
  BookOpen,
  ShieldCheck,
  Gavel,
} from "lucide-react";
import { dashboardAPI, servicesAPI } from "../services/api";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({});
  const [services, setServices] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingServices, setLoadingServices] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "Empowering Cooperatives",
      subtitle:
        "Connecting communities through shared growth, transparency, and trust.",
      bgImage:
        "https://images.unsplash.com/photo-1573164574394-20b1c7dc2db0?auto=format&fit=crop&w=1400&q=80",
      gradient:
        "linear-gradient(to bottom, rgba(0,0,0,0.45), rgba(0,0,0,0.25))",
    },
    {
      title: "Financial Inclusion for All",
      subtitle:
        "Providing accessible, member-driven banking services across the network.",
      bgImage:
        "https://images.unsplash.com/photo-1556742400-b5d06e5f0f22?auto=format&fit=crop&w=1400&q=80",
      gradient:
        "linear-gradient(to bottom, rgba(0,123,94,0.45), rgba(0,123,94,0.25))",
    },
    {
      title: "Smart Loan Management",
      subtitle:
        "Digitally streamline your cooperative’s loan processes and member tracking.",
      bgImage:
        "https://images.unsplash.com/photo-1600166892576-fb1ec6cd91b0?auto=format&fit=crop&w=1400&q=80",
      gradient:
        "linear-gradient(to bottom, rgba(217,119,6,0.45), rgba(217,119,6,0.25))",
    },
    {
      title: "Secure and Transparent Operations",
      subtitle:
        "Ensure compliance and member confidence through reliable audit systems.",
      bgImage:
        "https://images.unsplash.com/photo-1612832021610-239b8a4b5943?auto=format&fit=crop&w=1400&q=80",
      gradient:
        "linear-gradient(to bottom, rgba(126,34,206,0.45), rgba(126,34,206,0.25))",
    },
  ];

  const serviceMap = {
    3: { icon: <UserPlus size={28} />, color: "neutral" },
    4: { icon: <ClipboardCheck size={28} />, color: "warning" },
    5: { icon: <BookOpen size={28} />, color: "info" },
    6: { icon: <ShieldCheck size={28} />, color: "danger" },
    7: { icon: <Gavel size={28} />, color: "secondary" },
  };

  useEffect(() => {
    fetchStats();
    fetchServices();

    const slideTimer = setInterval(
      () => setCurrentSlide((prev) => (prev + 1) % slides.length),
      5000
    );
    return () => clearInterval(slideTimer);
  }, []);

 const fetchStats = async () => {
  try {
    const currentUser = JSON.parse(localStorage.getItem("user")) || {};
    const res = await dashboardAPI.getStats();

    if (currentUser.role === "admin") {
      let totalLoans = 0,
        pendingLoans = 0,
        totalUsers = 0;
      res?.data?.banks?.forEach((bank) => {
        totalLoans += bank.total_loans || 0;
        pendingLoans += bank.pending_loans || 0;
        totalUsers += bank.total_users || 0;
      });
      setStats({
        role: "admin",
        total_loans: totalLoans,
        pending_applications: pendingLoans,
        partnered_banks: res?.data?.banks?.length || 0,
        total_users: totalUsers,
      });
    } else if (currentUser.role === "manager") {
      const bank = res?.data?.bank;
      setStats({
        role: "manager",
        bank_name: bank?.bank_name,
        branch_name: bank?.branches?.[0]?.branch_name,
        total_loans: bank?.total_loans || 0,
        pending_applications: bank?.pending_loans || 0,
        total_users: bank?.total_users || 0,
        partnered_banks: 1,
        branch_stats: bank?.branches || [],
      });
    } else {
      // ✅ Regular User: Use user_stats from backend
      const userStats = res?.data?.user_stats || {};
      setStats({
        role: "user",
        user_name: userStats.user_name,
        total_loans: userStats.total_loans || 0,
        pending_applications: userStats.pending_loans || 0,
      });
    }
  } catch (err) {
    console.error("Error fetching stats:", err);
  } finally {
    setLoadingStats(false);
  }
};

  const fetchServices = async () => {
    try {
      const res = await servicesAPI.getServices();
      if (Array.isArray(res?.data)) {
        setServices(
          res.data.map((svc) => ({
            ...svc,
            icon: serviceMap[svc.id]?.icon || <UserPlus size={28} />,
            color: serviceMap[svc.id]?.color || "neutral",
          }))
        );
      }
    } catch (err) {
      console.error("Error fetching services:", err);
    } finally {
      setLoadingServices(false);
    }
  };

  const handleQuickAction = (action) => {
    const map = {
      "create-loan": "/create-loan",
      search: "/search",
      "view-loans": "/view-loans",
    };
    navigate(map[action]);
  };

  if (loadingStats || loadingServices)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress size="lg" />
      </Box>
    );

  // Different role-based card sets
  const renderStatsCards = () => {
    if (stats.role === "admin") {
      return [
        {
          label: "Total Loans",
          value: stats.total_loans,
          icon: <AccountBalance fontSize="large" />,
          color: "primary",
        },
        {
          label: "Loans on Due",
          value: stats.pending_applications,
          icon: <Assignment fontSize="large" />,
          color: "warning",
        },
        {
          label: "Partnered Banks",
          value: stats.partnered_banks,
          icon: <Groups fontSize="large" />,
          color: "info",
        },
        {
          label: "Total Users",
          value: stats.total_users,
          icon: <UserPlus fontSize="large" />,
          color: "secondary",
        },
      ];
    } else if (stats.role === "manager") {
      return [
        {
          label: `Bank: ${stats.bank_name || "-"}`,
          value: stats.total_loans,
          icon: <AccountBalance fontSize="large" />,
          color: "primary",
        },
        {
          label: "Pending Loans",
          value: stats.pending_applications,
          icon: <Assignment fontSize="large" />,
          color: "warning",
        },
        {
          label: "Total Users",
          value: stats.total_users,
          icon: <UserPlus fontSize="large" />,
          color: "neutral",
        },
        {
          label: "Branches",
          value: stats.branch_stats?.length || 1,
          icon: <AccountTree fontSize="large" />,
          color: "info",
        },
      ];
    } else {
  return [
    {
      label: `${stats.user_name ? stats.user_name + "'s " : ""}Loans`,
      value: stats.total_loans,
      icon: <AccountBalance fontSize="large" />,
      color: "primary",
    },
    {
      label: "Loans Due",
      value: stats.pending_applications,
      icon: <Assignment fontSize="large" />,
      color: "warning",
    },
  ];
}

  };

  return (
    <Box
      sx={{
        p: { xs: 2, md: 4 },
        bgcolor: "background.body",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Hero Slider */}
      <Box
        sx={{
          position: "relative",
          height: { xs: 240, md: 280 },
          borderRadius: "xl",
          overflow: "hidden",
          mb: 6,
          boxShadow: "lg",
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 80 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -80 }}
            transition={{ duration: 0.7 }}
            style={{
              backgroundImage: `${slides[currentSlide].gradient}, url(${slides[currentSlide].bgImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              color: "#fff",
              padding: "2rem",
              textAlign: "center",
            }}
          >
            <Box>
              <Typography level="h3" fontWeight="xl">
                {slides[currentSlide].title}
              </Typography>
              <Typography level="body-lg" sx={{ mt: 1, maxWidth: 600 }}>
                {slides[currentSlide].subtitle}
              </Typography>
            </Box>
          </motion.div>
        </AnimatePresence>
        <Stack
          direction="row"
          spacing={1}
          sx={{
            position: "absolute",
            bottom: 14,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 3,
          }}
        >
          {slides.map((_, idx) => (
            <Box
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              sx={{
                width: currentSlide === idx ? 18 : 10,
                height: 10,
                borderRadius: "xl",
                bgcolor: currentSlide === idx ? "neutral.100" : "neutral.500",
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
            />
          ))}
        </Stack>
      </Box>

      {/* Role-based Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 6 }}>
        {renderStatsCards().map((card, i) => (
          <Grid key={i} xs={12} sm={6} md={3}>
            <Tooltip title={card.label}>
              <Card
                variant="soft"
                color={card.color}
                sx={{
                  borderRadius: "lg",
                  p: 3,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: "lg",
                  },
                }}
              >
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Box>
                    <Typography level="body-sm" color="neutral.700">
                      {card.label}
                    </Typography>
                    <Typography level="h4" fontWeight={700}>
                      {card.value}
                    </Typography>
                  </Box>
                  {card.icon}
                </Stack>
              </Card>
            </Tooltip>
          </Grid>
        ))}
      </Grid>

      {/* Quick Actions */}
      <Card
        variant="outlined"
        sx={{
          p: 3,
          borderRadius: "lg",
          boxShadow: "sm",
          mb: 6,
        }}
      >
        <Typography level="h5" fontWeight={600}>
          Quick Actions
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Grid container spacing={3}>
          {[
            { label: "Create Loan", icon: <AddCircleOutline />, action: "create-loan" },
            { label: "Search Loans", icon: <Search />, action: "search" },
            { label: "View My Loans", icon: <Assignment />, action: "view-loans" },
          ].map((item, idx) => (
            <Grid key={idx} xs={12} sm={6} md={4}>
              <Button
                fullWidth
                startDecorator={item.icon}
                onClick={() => handleQuickAction(item.action)}
                sx={{
                  py: 1.2,
                  fontWeight: 500,
                  "&:hover": { transform: "translateY(-3px)", boxShadow: "md" },
                }}
              >
                {item.label}
              </Button>
            </Grid>
          ))}
        </Grid>
      </Card>

      {/* Services */}
      <Box sx={{ mb: 6 }}>
        <Typography level="h5" fontWeight={600} mb={3}>
          Platform Services
        </Typography>
        <Grid container spacing={3}>
          {services.map((service) => (
            <Grid key={service.id} xs={12} sm={6} md={4}>
              <Card
                variant="outlined"
                sx={{
                  borderRadius: "md",
                  boxShadow: "sm",
                  transition: "all 0.3s ease",
                  "&:hover": { boxShadow: "lg", transform: "translateY(-4px)" },
                }}
              >
                <Stack direction="row" spacing={2} alignItems="center" sx={{ p: 2 }}>
                  <Box sx={{ color: `${service.color}.main` }}>{service.icon}</Box>
                  <Box>
                    <Typography level="body-md" fontWeight={600}>
                      {service.name}
                    </Typography>
                    <Typography level="body-sm" color="neutral.500">
                      {service.description}
                    </Typography>
                  </Box>
                </Stack>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          textAlign: "center",
          py: 4,
          mt: "auto",
          borderTop: "1px solid #e0e0e0",
        }}
      >
        <Typography level="body-sm" color="neutral.500">
          &copy; {new Date().getFullYear()} CoNetX. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
};

export default Dashboard;
