import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  Typography,
  Grid,
  Button,
  Divider,
  CircularProgress,
  Stack,
} from "@mui/joy";
import {
  AccessTime,
  AccountBalance,
  Assignment,
  AddCircleOutline,
  Business,
  Search,
} from "@mui/icons-material";
import { dashboardAPI } from "../services/api";
import logo from "../assets/logo_home.png"; // ✅ use your improved home logo

const Dashboard = ({ onNavigate }) => {
  const [stats, setStats] = useState({ total_loans: 0, pending_applications: 0 });
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    fetchStats();
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const fetchStats = async () => {
    try {
      const res = await dashboardAPI.getStats();
      setStats(res.data || {});
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date) =>
    date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );

  return (
    <Box
      sx={{
        p: { xs: 2, md: 4 },
        bgcolor: "background.body",
        minHeight: "100vh",
      }}
    >
      {/* 🌟 Header Section */}
      <Box
        sx={{
          textAlign: "center",
          mb: 4,
        }}
      >
        {/* <Box
          component="img"
          src={logo}
          alt="Cooperative Bank Network Logo"
          sx={{
            width: { xs: 200, sm: 260, md: 320 },
            height: "auto",
            objectFit: "contain",
            mb: 1.5,
            filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.25))",
          }}
        /> */}
        {/* <Typography level="h4" fontWeight={700} mb={0.5}>
          Cooperative Bank Network
        </Typography> */}
        <Typography level="body-md" color="neutral.600">
          Empowering cooperative banks through one connected digital platform.
        </Typography>
        <Stack
          direction="row"
          justifyContent="center"
          alignItems="center"
          spacing={1}
          mt={1}
        >
          <AccessTime fontSize="small" />
          <Typography level="body-sm" color="neutral.500">
            {currentTime.toLocaleDateString("en-US")} • {formatTime(currentTime)}
          </Typography>
        </Stack>
      </Box>

      {/* 📊 Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {[
          {
            label: "Total Loans",
            value: stats.total_loans,
            icon: <AccountBalance fontSize="large" />,
            color: "primary",
          },
          {
            label: "Pending Applications",
            value: stats.pending_applications,
            icon: <Assignment fontSize="large" />,
            color: "warning",
          },
          {
            label: "Our Services",
            value: "Explore offerings",
            icon: <Business fontSize="large" />,
            color: "success",
          },
        ].map((card, i) => (
          <Grid key={i} xs={12} sm={6} md={4}>
            <Card
              variant="soft"
              color={card.color}
              sx={{
                borderRadius: "lg",
                transition: "all 0.3s ease",
                "&:hover": { transform: "translateY(-5px)", boxShadow: "lg" },
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
          </Grid>
        ))}
      </Grid>

      {/* ⚡ Quick Actions */}
      <Card
        variant="outlined"
        sx={{
          p: 3,
          borderRadius: "lg",
          boxShadow: "sm",
          mb: 4,
        }}
      >
        <Typography level="h6" fontWeight={600}>
          Quick Actions
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Grid container spacing={2}>
          {[
            {
              label: "Create Loan",
              icon: <AddCircleOutline />,
              action: "create-loan",
            },
            {
              label: "View Loans",
              icon: <Assignment />,
              action: "view-applications",
            },
            {
              label: "View Services",
              icon: <Business />,
              action: "services",
            },
          ].map((item, idx) => (
            <Grid key={idx} xs={12} sm={6} md={4}>
              <Button
                fullWidth
                startDecorator={item.icon}
                onClick={() => onNavigate(item.action)}
                sx={{
                  py: 1.2,
                  fontWeight: 500,
                }}
              >
                {item.label}
              </Button>
            </Grid>
          ))}
        </Grid>
      </Card>

      {/* 🔍 Application Options */}
      <Card
        variant="outlined"
        sx={{
          p: 3,
          borderRadius: "lg",
          boxShadow: "sm",
        }}
      >
        <Typography level="h6" fontWeight={600}>
          Application Options
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Grid container spacing={2}>
          {[
            {
              title: "Search Loans",
              desc: "Quickly find and view loan details.",
              icon: <Search />,
              action: "private-search",
            },
            {
              title: "New Loan",
              desc: "Create a new loan request.",
              icon: <AddCircleOutline />,
              action: "create-loan",
            },
            {
              title: "My Loans",
              desc: "View and manage your submitted loans.",
              icon: <Assignment />,
              action: "view-applications",
            },
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
                    <Typography level="title-md" fontWeight={600}>
                      {item.title}
                    </Typography>
                    <Typography level="body-sm" color="neutral.500">
                      {item.desc}
                    </Typography>
                  </Box>
                </Stack>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Card>
    </Box>
  );
};

export default Dashboard;
