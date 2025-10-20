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
} from "@mui/joy";
import {
  AccessTime,
  AccountBalance,
  Assignment,
  AddCircleOutline,
  Business,
  Search,
  People,
} from "@mui/icons-material";
import { UserPlus, ClipboardCheck, BookOpen, ShieldCheck, Gavel } from "lucide-react";
import { dashboardAPI, servicesAPI } from "../services/api";

const Dashboard = ({ onNavigate }) => {
  const [stats, setStats] = useState({
    total_loans: 0,
    pending_applications: 0,
    // new stat:
    total_members: 0,
  });
  const [services, setServices] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingServices, setLoadingServices] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

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
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const fetchStats = async () => {
    try {
      const res = await dashboardAPI.getStats();
      if (res?.data) {
        setStats({
          total_loans: res.data.total_loans || 0,
          pending_applications: res.data.pending_applications || 0,
          total_members: res.data.total_members || 0,
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

  const formatTime = (date) =>
    date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  if (loadingStats || loadingServices) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress size="lg" />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: "background.body", minHeight: "100vh" }}>
      {/* Slider / Hero Section */}
      <Box sx={{ position: "relative", mb: 6 }}>
        {/* Placeholder – integrate your slider component here */}
        <Box
          sx={{
            height: 300,
            backgroundImage: `url("/path-to-your-indian-coop-bank-image.jpg")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Box sx={{ 
            position: "absolute",
            inset: 0,
            bgcolor: "rgba(0,0,0,0.5)"
          }} />
          <Typography
            level="h2"
            sx={{
              position: "relative",
              color: "white",
              fontWeight: 700,
              textAlign: "center",
              px: 2,
            }}
          >
            Connecting Every Cooperative Bank in India  
            <br />
            One Network • Full Visibility • Collective Growth
          </Typography>
        </Box>
      </Box>

      {/* Header */}
      {/* <Box sx={{ textAlign: "center", mb: 6 }}>
        <Typography level="h3" fontWeight="xl" mb={2}>
          Cooperative Bank Network Dashboard
        </Typography>
        <Typography level="body-md" color="neutral.600" maxWidth={600} mx="auto">
          Empowering cooperative banks through one connected digital platform. Connect, monitor, and manage loans and services across all cooperative banks in your network.
        </Typography>
        <Stack direction="row" justifyContent="center" alignItems="center" spacing={1} mt={2}>
          <AccessTime fontSize="small" />
          <Typography level="body-sm" color="neutral.500">
            {currentTime.toLocaleDateString("en-US")} • {formatTime(currentTime)}
          </Typography>
        </Stack>
      </Box> */}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 6 }}>
        {[
          { label: "Total Loans", value: stats.total_loans, icon: <AccountBalance fontSize="large" />, color: "primary" },
          { label: "Loans on Due", value: stats.pending_applications, icon: <Assignment fontSize="large" />, color: "warning" },
          { label: "Active Members", value: stats.total_members, icon: <People fontSize="large" />, color: "success" },
        ].map((card, i) => (
          <Grid key={i} xs={12} sm={6} md={4}>
            <Card
              variant="soft"
              color={card.color}
              sx={{
                borderRadius: "lg",
                p: 3,
                transition: "all 0.3s ease",
                "&:hover": { transform: "translateY(-5px)", boxShadow: "lg" },
              }}
            >
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography level="body-sm" color="neutral.700">{card.label}</Typography>
                  <Typography level="h4" fontWeight={700}>{card.value}</Typography>
                </Box>
                {card.icon}
              </Stack>
            </Card>
          </Grid>
        ))}
      </Grid>
{/* Application Tools Section */}
      <Card variant="outlined" sx={{ p: 3, borderRadius: "lg", boxShadow: "sm" }}>
        <Typography level="h5" fontWeight={600}>Tools & Options</Typography>
        <Divider sx={{ my: 2 }} />
        <Grid container spacing={3}>
          {[
            { title: "Search Loans Across Network", desc: "Find any loan and its status across all connected banks.", icon: <Search />, action: "private-search" },
            { title: "Add Loan", desc: "Add a loan from your cooperative bank into the network.", icon: <UserPlus />, action: "create-loan" },
            { title: "Monitor Repayments", desc: "Track loan repayments and overdue schedules across the network.", icon: <ClipboardCheck />, action: "view-applications" },
          ].map((item, idx) => (
            <Grid key={idx} xs={12} sm={6} md={4}>
              <Card
                onClick={() => onNavigate(item.action)}
                variant="soft"
                sx={{
                  p: 2.5,
                  cursor: "pointer",
                  transition: "0.3s",
                  "&:hover": { boxShadow: "md", transform: "translateY(-4px)" },
                }}
              >
                <Stack direction="row" spacing={2} alignItems="center">
                  {item.icon}
                  <Box>
                    <Typography level="body-md" fontWeight={600}>{item.title}</Typography>
                    <Typography level="body-sm" color="neutral.500">{item.desc}</Typography>
                  </Box>
                </Stack>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Card>
      {/* Services Section */}
      <Box sx={{ mb: 6 }}>
        <Typography level="h5" fontWeight={600} mb={3}>Platform Services</Typography>
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
                    <Typography level="body-md" fontWeight={600}>{service.name}</Typography>
                    <Typography level="body-sm" color="neutral.500">{service.description}</Typography>
                  </Box>
                </Stack>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      
    </Box>
  );
};

export default Dashboard;
