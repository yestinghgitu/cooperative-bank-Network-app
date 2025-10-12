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
import { Briefcase, FileText, Gavel, ShieldCheck, Banknote } from "lucide-react";
import { servicesAPI } from "../services/api";

const Services = ({ onBack }) => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await servicesAPI.getServices();
        // ensure we always get an array
        setServices(Array.isArray(res?.data) ? res.data : res?.services || []);
      } catch (err) {
        console.error("Error loading services:", err);
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

  return (
    <Box sx={{ p: 3 }}>
      <Typography level="h4" fontWeight="lg" mb={2}>
        Our Services
      </Typography>

      <Grid container spacing={2}>
        {(services.length > 0 ? services : [
          {
            id: 1,
            name: "Financial Advisory",
            description: "Expert advice on savings, investments, and loans.",
            icon: <Briefcase size={28} />,
            color: "primary",
          },
          {
            id: 2,
            name: "Loan Auditing",
            description: "Detailed verification and analysis of loan accounts.",
            icon: <FileText size={28} />,
            color: "success",
          },
          {
            id: 3,
            name: "Legal Support",
            description: "Legal consultation and document validation.",
            icon: <Gavel size={28} />,
            color: "warning",
          },
          {
            id: 4,
            name: "Insurance",
            description: "Comprehensive coverage and premium management.",
            icon: <ShieldCheck size={28} />,
            color: "neutral",
          },
          {
            id: 5,
            name: "Microfinance",
            description: "Small-scale loans for local entrepreneurs.",
            icon: <Banknote size={28} />,
            color: "danger",
          },
        ]).map((service) => (
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
