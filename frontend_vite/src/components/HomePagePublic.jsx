import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Stack,
  Sheet,
} from "@mui/joy";
import { ArrowRight, CheckCircle2, Building2, FileCheck, UserPlus, FileText } from "lucide-react";
import logo from "../assets/conetx_logo_new.png";

// -----------------------------
// PUBLIC SERVICES LIST
// -----------------------------
const publicServices = [
  {
    icon: <UserPlus size={32} color="#1976d2" />,
    title: "Member Registration",
    desc: "Register and verify new members in CoNetX.",
    features: ["Create member profiles", "Assign membership ID", "KYC + Aadhaar verification", "Mobile verification"],
  },
  {
    icon: <FileCheck size={32} color="#2e7d32" />,
    title: "Loan Verification System",
    desc: "Internal & cross-society loan duplication checking.",
    features: ["Internal loan check", "Cross-society verification", "Aadhaar-based lookup", "Mobile number tracing"],
  },
  {
    icon: <Building2 size={32} color="#d32f2f" />,
    title: "Audit & Compliance",
    desc: "Monitor and validate cooperative transactions.",
    features: ["Audit reports", "Compliance checks", "Transaction validation"],
  },
  {
    icon: <FileText size={32} color="#ff9800" />,
    title: "Editable Documents",
    desc: "Provide editable templates for cooperative banks and societies.",
    features: ["Membership forms", "Loan application templates", "Audit & compliance forms", "Customizable documents"],
  },
];

export default function HomePagePublic() {
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.body", pb: { xs: 6, md: 10 } }}>
      
      {/* ----------------------------- */}
      {/* HERO SECTION */}
      {/* ----------------------------- */}
      <Sheet
        variant="soft"
        sx={{
          px: { xs: 2, sm: 3, md: 6 },
          py: { xs: 4, md: 6 },
          borderRadius: "0 0 24px 24px",
          textAlign: "center",
          mt: -1,
          background: "linear-gradient(135deg, #e3f2fd 0%, #ffffff 60%)",
        }}
      >
        <Box
          component="img"
          src={logo}
          alt="CoNetX Logo"
          sx={{
            height: { xs: 80, sm: 100, md: 150 },
            mb: { xs: 2, md: 3 },
            filter: "drop-shadow(0 4px 4px rgba(0,0,0,0.15))",
          }}
        />

        <Typography level="h3" fontWeight="lg" sx={{ mb: 1, fontSize: { xs: "1.6rem", md: "2.2rem" } }}>
          CoNetX – Cooperative Banking Cloud Platform
        </Typography>

        <Typography level="body-md" sx={{ maxWidth: 700, mx: "auto", color: "neutral.600", mb: 3, fontSize: { xs: "0.95rem", md: "1rem" } }}>
          A unified and secure digital platform for cooperative societies, credit unions, and banking institutions to manage members, loans, auditing, compliance, and financial operations.
        </Typography>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="center">
          <Button
            size="lg"
            variant="solid"
            color="primary"
            endDecorator={<ArrowRight />}
            onClick={() => navigate("/login")}
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            Login
          </Button>

          <Button
            size="lg"
            variant="outlined"
            color="success"
            onClick={() => navigate("/contact")}
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            Request Demo
          </Button>
        </Stack>
      </Sheet>

      {/* ----------------------------- */}
      {/* PUBLIC SERVICES */}
      {/* ----------------------------- */}
      <Box sx={{ px: { xs: 2, sm: 3, md: 6 }, mt: 6 }}>
        <Typography level="h3" sx={{ textAlign: "center", fontWeight: "lg", mb: 4, fontSize: { xs: "1.5rem", md: "1.8rem" } }}>
          Services Available to Cooperative Societies
        </Typography>

        <Grid container spacing={{ xs: 2, sm: 3 }}>
          {publicServices.map((service, i) => (
            <Grid key={i} xs={12} sm={6} md={4}>
              <Card
                variant="outlined"
                sx={{
                  borderRadius: "lg",
                  p: { xs: 2, md: 3 },
                  height: "100%",
                  boxShadow: "sm",
                  transition: "0.3s",
                  textAlign: "left",
                  "&:hover": { boxShadow: "lg", transform: "translateY(-4px)" },
                }}
              >
                <CardContent>
                  <Box sx={{ mb: 1 }}>{service.icon}</Box>

                  <Typography level="title-lg" fontWeight="700" mb={1} sx={{ fontSize: { xs: "1.1rem", md: "1.3rem" } }}>
                    {service.title}
                  </Typography>

                  <Typography level="body-sm" sx={{ color: "neutral.600", mb: 2, fontSize: { xs: "0.875rem", md: "0.95rem" } }}>
                    {service.desc}
                  </Typography>

                  <Stack spacing={0.8}>
                    {service.features.map((f, j) => (
                      <Stack key={j} direction="row" spacing={1} alignItems="center">
                        <CheckCircle2 size={16} color="#4caf50" />
                        <Typography level="body-xs" sx={{ fontSize: { xs: "0.75rem", md: "0.8rem" } }}>{f}</Typography>
                      </Stack>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* ----------------------------- */}
      {/* COMPANY INFO SECTION */}
      {/* ----------------------------- */}
      <Sheet
        variant="plain"
        sx={{
          mt: 6,
          px: { xs: 2, sm: 3, md: 6 },
          py: 4,
          borderRadius: "lg",
          textAlign: "center",
          bgcolor: "neutral.softBg",
        }}
      >
        <Typography level="h4" fontWeight="lg" sx={{ fontSize: { xs: "1.4rem", md: "1.8rem" } }}>
          CoNetX Software Solutions Pvt. Ltd.
        </Typography>

        <Typography level="body-sm" sx={{ mt: 1 }}>
          Office Address: No 55, 10th B Cross, Mukuntamma Nagara, Banasawadi, Bengaluru – 560064
        </Typography>

        <Typography level="body-sm" sx={{ mt: 0.5 }}>
          Email: <a href="mailto:b2bnetworkguide@gmail.com">b2bnetworkguide@gmail.com</a>,{" "}
          <a href="mailto:conetx.notifications@gmail.com">conetx.notifications@gmail.com</a> <br />
          Phone: <a href="tel:+917892611670">7892611670</a> / <a href="tel:+919738958721">9738958721</a> / <a href="tel:+919480595927">94805 95927</a>
        </Typography>
      </Sheet>

      {/* ----------------------------- */}
      {/* QUICK LINKS */}
      {/* ----------------------------- */}
      <Stack direction="row" spacing={3} mt={4} justifyContent="center" sx={{ flexWrap: "wrap" }}>
        {[
          ["About Us", "/about"],
          ["Terms", "/terms"],
          ["Privacy Policy", "/privacy"],
          ["Contact", "/contact"],
        ].map(([label, route]) => (
          <Button key={route} variant="plain" color="neutral" onClick={() => navigate(route)} sx={{ fontWeight: 600, fontSize: { xs: "0.85rem", md: "0.95rem" } }}>
            {label}
          </Button>
        ))}
      </Stack>

      {/* ----------------------------- */}
      {/* COPYRIGHT FOOTER */}
      {/* ----------------------------- */}
      <Box
        component="footer"
        sx={{
          mt: 6,
          py: 3,
          textAlign: "center",
          bgcolor: "background.level1",
          color: "neutral.600",
          fontSize: { xs: "0.7rem", md: "0.8rem" },
        }}
      >
        <Typography level="body-xs">© 2025 CoNetX. All rights reserved.</Typography>
      </Box>
    </Box>
  );
}
