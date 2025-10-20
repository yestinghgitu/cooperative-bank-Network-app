import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Sheet,
  Grid,
} from "@mui/joy";
import { UserPlus, ClipboardCheck, BookOpen, ShieldCheck, Gavel } from "lucide-react";
import { servicesAPI } from "../services/api";

const Services = ({ onBack }) => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mapping of service IDs to icons and colors
  const serviceMap = {
    3: { icon: <UserPlus size={28} />, color: "neutral" },
    4: { icon: <ClipboardCheck size={28} />, color: "warning" },
    5: { icon: <BookOpen size={28} />, color: "info" },
    6: { icon: <ShieldCheck size={28} />, color: "danger" },
    7: { icon: <Gavel size={28} />, color: "secondary" },
  };

  useEffect(() => {
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
        } else {
          setServices([]);
        }
      } catch (err) {
        console.error("Error loading services:", err);
        setServices([]);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress size="lg" />
      </Box>
    );

  if (services.length === 0)
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography level="h5" mb={2}>
          No services available at the moment.
        </Typography>
        <Button variant="soft" color="neutral" onClick={onBack}>
          ← Back to Dashboard
        </Button>
      </Box>
    );

  return (
    <Box sx={{ p: 3 }}>
      <Typography level="h4" fontWeight="lg" mb={2}>
        Our Services
      </Typography>

      <Grid container spacing={2}>
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
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 1,
                    color: `${service.color}.main`,
                  }}
                >
                  {service.icon}
                </Box>
                <Typography level="h5" textAlign="center" mb={1}>
                  {service.name}
                </Typography>
                <Typography
                  level="body-sm"
                  textAlign="center"
                  sx={{ color: "text.secondary" }}
                >
                  {service.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Sheet sx={{ textAlign: "center", mt: 3, p: 2 }}>
        <Button variant="soft" color="neutral" onClick={onBack}>
          ← Back to Dashboard
        </Button>
      </Sheet>
    </Box>
  );
};

export default Services;
