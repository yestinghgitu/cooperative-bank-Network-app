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
} from "@mui/icons-material";
import {
  UserPlus,
  ClipboardCheck,
  BookOpen,
  ShieldCheck,
  Gavel,
} from "lucide-react";
import { dashboardAPI, servicesAPI } from "../services/api";

const Dashboard = ({ onNavigate }) => {
  const [stats, setStats] = useState({
    total_loans: 0,
    pending_applications: 0,
    partnered_banks: 0,
  });
  const [services, setServices] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingServices, setLoadingServices] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "Empowering Cooperative Banks",
      subtitle:
        "Connecting communities through shared growth, transparency, and trust.",
      bgImage:
        "https://images.unsplash.com/photo-1573164574394-20b1c7dc2db0?auto=format&fit=crop&w=1400&q=80",
      gradient:
        "linear-gradient(to bottom, rgba(0,0,0,0.55), rgba(0,0,0,0.35))",
    },
    {
      title: "Financial Inclusion for All",
      subtitle:
        "Providing accessible, member-driven banking services across the network.",
      bgImage:
        "https://images.unsplash.com/photo-1556742400-b5d06e5f0f22?auto=format&fit=crop&w=1400&q=80",
      gradient:
        "linear-gradient(to bottom, rgba(0,123,94,0.55), rgba(0,123,94,0.35))",
    },
    {
      title: "Smart Loan Management",
      subtitle:
        "Digitally streamline your cooperative’s loan processes and member tracking.",
      bgImage:
        "https://images.unsplash.com/photo-1600166892576-fb1ec6cd91b0?auto=format&fit=crop&w=1400&q=80",
      gradient:
        "linear-gradient(to bottom, rgba(217,119,6,0.55), rgba(217,119,6,0.35))",
    },
    {
      title: "Secure and Transparent Operations",
      subtitle:
        "Ensure compliance and member confidence through reliable audit systems.",
      bgImage:
        "https://images.unsplash.com/photo-1612832021610-239b8a4b5943?auto=format&fit=crop&w=1400&q=80",
      gradient:
        "linear-gradient(to bottom, rgba(126,34,206,0.55), rgba(126,34,206,0.35))",
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

    const slideTimer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(slideTimer);
  }, []);

  const fetchStats = async () => {
    try {
      const res = await dashboardAPI.getStats();
      if (res?.data) {
        setStats({
          total_loans: res.data.total_loans || 0,
          pending_applications: res.data.pending_applications || 0,
          partnered_banks: res.data.partnered_banks || 25,
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

  if (loadingStats || loadingServices) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress size="lg" />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: { xs: 2, md: 4 },
        bgcolor: "#f5f7fa",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* === Hero Slider === */}
      <Box
        sx={{
          position: "relative",
          height: { xs: 240, md: 280 },
          borderRadius: "xl",
          overflow: "hidden",
          mb: 6,
          boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
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
            <Typography level="h3" fontWeight="xl" sx={{ textShadow: "2px 2px 6px rgba(0,0,0,0.6)" }}>
              {slides[currentSlide].title}
            </Typography>
            <Typography
              level="body-lg"
              sx={{ mt: 1, maxWidth: 600, textShadow: "1px 1px 4px rgba(0,0,0,0.6)" }}
            >
              {slides[currentSlide].subtitle}
            </Typography>
          </motion.div>
        </AnimatePresence>

        {/* Slide Indicators */}
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
                width: currentSlide === idx ? 20 : 12,
                height: 10,
                borderRadius: "xl",
                bgcolor: currentSlide === idx ? "#fff" : "rgba(255,255,255,0.5)",
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
            />
          ))}
        </Stack>
      </Box>

      {/* === Stats Cards === */}
      <Grid container spacing={3} sx={{ mb: 6 }}>
        {[
          {
            label: "Total Loans",
            value: stats.total_loans,
            icon: <AccountBalance fontSize="large" />,
            color: "primary",
            badge: <Chip color="success" size="sm">Active</Chip>,
            tooltip: "Total loans across all banks",
          },
          {
            label: "Loans on Due",
            value: stats.pending_applications,
            icon: <Assignment fontSize="large" />,
            color: "warning",
            badge: <Chip color="danger" size="sm">Attention</Chip>,
            tooltip: "Loans pending repayment",
          },
          {
            label: "Partnered Banks",
            value: stats.partnered_banks,
            icon: <Groups fontSize="large" />,
            color: "info",
            badge: <Chip color="info" size="sm">Network</Chip>,
            tooltip: "Total partnered banks in the network",
          },
        ].map((card, i) => (
          <Grid key={i} xs={12} sm={6} md={4}>
            <Tooltip title={card.tooltip}>
              <Card
                variant="soft"
                color={card.color}
                sx={{
                  borderRadius: "lg",
                  p: 3,
                  transition: "all 0.4s ease",
                  "&:hover": { transform: "translateY(-6px)", boxShadow: "0 12px 28px rgba(0,0,0,0.18)" },
                }}
              >
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography level="body-sm" color="neutral.700">{card.label}</Typography>
                    <Typography level="h4" fontWeight={700}>{card.value}</Typography>
                    <Box sx={{ mt: 0.5 }}>{card.badge}</Box>
                  </Box>
                  {card.icon}
                </Stack>
              </Card>
            </Tooltip>
          </Grid>
        ))}
      </Grid>

      {/* === Quick Actions === */}
      <Card variant="outlined" sx={{ p: 3, borderRadius: "lg", boxShadow: "sm", mb: 6 }}>
        <Typography level="h5" fontWeight={600}>Quick Actions</Typography>
        <Divider sx={{ my: 2 }} />
        <Grid container spacing={3}>
          {[
            { label: "Create Loan", icon: <AddCircleOutline />, action: "create-loan" },
            { label: "Search Loans", icon: <Search />, action: "private-search" },
            { label: "View My Loans", icon: <Assignment />, action: "view-applications" },
          ].map((item, idx) => (
            <Grid key={idx} xs={12} sm={6} md={4}>
              <Button
                fullWidth
                startDecorator={item.icon}
                onClick={() => onNavigate(item.action)}
                sx={{
                  py: 1.2,
                  fontWeight: 500,
                  "&:hover": { transform: "translateY(-3px) scale(1.02)", boxShadow: "0 6px 18px rgba(0,0,0,0.15)" },
                }}
              >
                {item.label}
              </Button>
            </Grid>
          ))}
        </Grid>
      </Card>

      {/* === Services Section === */}
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
                  "&:hover": { boxShadow: "lg", transform: "translateY(-4px) scale(1.02)" },
                }}
              >
                <Stack direction="row" spacing={2} alignItems="center" sx={{ p: 2 }}>
                  <Box sx={{ color: `${service.color}.main` }}>{service.icon}</Box>
                  <Box>
                    <Typography level="body-md" fontWeight={600}>{service.name}</Typography>
                    <Typography level="body-sm" color="neutral.500">{service.description}</Typography>
                  </Box>
                </Stack>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* === Footer === */}
      <Box sx={{ textAlign: "center", py: 4, mt: "auto", bgcolor: "#e3f2fd", borderTop: "1px solid #ccc" }}>
        <Typography level="body-sm" color="neutral.600">
          &copy; {new Date().getFullYear()} Indian Cooperative Bank Network. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
};

export default Dashboard;
