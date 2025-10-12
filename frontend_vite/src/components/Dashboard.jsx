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
    <Box sx={{ p: 3, bgcolor: "background.body", minHeight: "100vh" }}>
      <Card variant="soft" sx={{ mb: 3, p: 3, borderRadius: "lg" }}>
        <Stack direction="row" justifyContent="space-between">
          <Box>
            <Typography level="h5">Cooperative Bank Network</Typography>
            <Typography level="body-sm" color="neutral.500">
              Hello, welcome back!
            </Typography>
          </Box>
          <Box textAlign="right">
            <Typography level="body-xs" color="neutral.500">
              {currentTime.toLocaleDateString("en-US")}
            </Typography>
            <Typography level="title-md">
              <AccessTime fontSize="small" /> {formatTime(currentTime)}
            </Typography>
          </Box>
        </Stack>
      </Card>

      <Grid container spacing={2}>
        {[
          {
            label: "Total Loans",
            value: stats.total_loans,
            icon: <AccountBalance />,
            color: "primary",
          },
          {
            label: "Pending Applications",
            value: stats.pending_applications,
            icon: <Assignment />,
            color: "warning",
          },
          {
            label: "Our Services",
            value: "Explore offerings",
            icon: <Business />,
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
                "&:hover": { boxShadow: "md" },
              }}
            >
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography level="body-xs" color="neutral.500">
                    {card.label}
                  </Typography>
                  <Typography level="h5" fontWeight={700}>
                    {card.value}
                  </Typography>
                </Box>
                {card.icon}
              </Stack>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card variant="outlined" sx={{ mt: 4, p: 3, borderRadius: "lg" }}>
        <Typography level="h6">Quick Actions</Typography>
        <Divider sx={{ my: 2 }} />
        <Grid container spacing={2}>
          <Grid xs={12} sm={6} md={4}>
            <Button
              fullWidth
              startDecorator={<AddCircleOutline />}
              onClick={() => onNavigate("create-loan")}
            >
              Create Loan
            </Button>
          </Grid>
          <Grid xs={12} sm={6} md={4}>
            <Button
              fullWidth
              startDecorator={<Assignment />}
              onClick={() => onNavigate("view-applications")}
            >
              View Applications
            </Button>
          </Grid>
          <Grid xs={12} sm={6} md={4}>
            <Button
              fullWidth
              startDecorator={<Business />}
              onClick={() => onNavigate("services")}
            >
              View Services
            </Button>
          </Grid>
        </Grid>
      </Card>

      <Card variant="outlined" sx={{ mt: 4, p: 3, borderRadius: "lg" }}>
        <Typography level="h6">Application Methods</Typography>
        <Divider sx={{ my: 2 }} />
        <Grid container spacing={2}>
          {[
            {
              title: "Search Applications",
              desc: "Search and view loan details",
              icon: <Search />,
              action: "private-search",
            },
            {
              title: "Traditional Application",
              desc: "Use our traditional form",
              icon: <AddCircleOutline />,
              action: "create-loan",
            },
            {
              title: "My Applications",
              desc: "View your submitted loans",
              icon: <Assignment />,
              action: "view-applications",
            },
          ].map((item, idx) => (
            <Grid key={idx} xs={12} sm={6} md={4}>
              <Card
                onClick={() => onNavigate(item.action)}
                variant="soft"
                sx={{
                  p: 2,
                  cursor: "pointer",
                  "&:hover": { boxShadow: "md", transform: "translateY(-3px)" },
                }}
              >
                <Stack direction="row" spacing={2} alignItems="center">
                  {item.icon}
                  <Box>
                    <Typography level="title-md">{item.title}</Typography>
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
