import React from "react";
import {
  Box,
  Typography,
  Sheet,
  Divider,
  Chip,
  Stack,
} from "@mui/joy";
import { Scale, ShieldCheck, FileText } from "lucide-react";

const Terms = () => {
  const sections = [
    {
      title: "1. Overview",
      text: `The CoNetX (“CoNetX”) platform enables cooperative banks and credit societies to record, manage, and verify borrowers’ existing loans — preventing duplicate or fraudulent loan applications while promoting responsible lending.`,
    },
    {
      title: "2. Eligibility",
      text: `Access is limited to officially registered cooperative banks, credit societies, and verified authorized personnel. Unauthorized use is strictly prohibited.`,
    },
    {
      title: "3. User Responsibilities",
      text: `Users must provide accurate data, ensure ethical usage, and maintain the confidentiality of their login credentials. Any misuse may lead to suspension or legal action.`,
    },
    {
      title: "4. Data Accuracy & Verification",
      text: `Each participating institution is responsible for validating its own data before submission. CoNetX facilitates data exchange but does not independently audit or verify accuracy.`,
    },
    {
      title: "5. Confidentiality",
      text: `Sensitive borrower and loan data are shared only among verified member institutions. This information must be accessed and used solely for legitimate financial verification purposes.`,
    },
    {
      title: "6. Intellectual Property",
      text: `All software, design, branding, and documentation are the exclusive intellectual property of CoNetX. Unauthorized reproduction or distribution is prohibited.`,
    },
    {
      title: "7. Limitation of Liability",
      text: `The platform is provided on an “as is” and “as available” basis. CoNetX shall not be liable for any loss, error, downtime, or misuse of shared information.`,
    },
    {
      title: "8. Governing Law",
      text: `These Terms are governed by the laws of India. Disputes shall be subject to the exclusive jurisdiction of competent courts located in Mumbai, Maharashtra.`,
    },
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        py: { xs: 4, md: 8 },
        px: { xs: 2, md: 4 },
        background: "linear-gradient(135deg, #f7f9fc 0%, #eef2f7 100%)",
      }}
    >
      <Sheet
        variant="soft"
        sx={{
          maxWidth: 950,
          mx: "auto",
          p: { xs: 3, md: 5 },
          borderRadius: "2xl",
          boxShadow: "lg",
          backdropFilter: "blur(12px)",
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          animation: "fadeIn 0.8s ease",
          "@keyframes fadeIn": {
            from: { opacity: 0, transform: "translateY(10px)" },
            to: { opacity: 1, transform: "translateY(0)" },
          },
        }}
      >
        {/* Header Section */}
        <Stack alignItems="center" spacing={1.5} sx={{ mb: 4 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
            }}
          >
            <FileText size={28} color="#1976d2" />
            <Typography level="h3" sx={{ color: "primary.plainColor" }}>
              Terms & Conditions
            </Typography>
          </Box>
          <Chip
            variant="soft"
            color="neutral"
            size="sm"
            sx={{ fontSize: "0.75rem", fontWeight: 500 }}
          >
            Effective Date: October 27, 2025 • Version 2.1
          </Chip>
        </Stack>

        {/* Sections */}
        <Stack spacing={3}>
          {sections.map((section, index) => (
            <Box
              key={index}
              sx={{
                animation: `fadeInSection 0.6s ease ${index * 0.1}s both`,
                "@keyframes fadeInSection": {
                  from: { opacity: 0, transform: "translateY(8px)" },
                  to: { opacity: 1, transform: "translateY(0)" },
                },
              }}
            >
              <Typography
                level="h4"
                sx={{
                  mb: 1,
                  color: "neutral.900",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                {index === 0 && <Scale size={18} color="#1976d2" />}
                {index === 4 && <ShieldCheck size={18} color="#1976d2" />}
                {section.title}
              </Typography>
              <Typography
                level="body-md"
                sx={{ color: "text.secondary", lineHeight: 1.7 }}
              >
                {section.text}
              </Typography>
            </Box>
          ))}
        </Stack>

        {/* Divider and Contact Info */}
        <Divider sx={{ my: 4 }} />
        <Stack spacing={0.5} alignItems="center">
          <Typography level="body-sm" sx={{ color: "text.secondary" }}>
            For legal or compliance inquiries:
          </Typography>
          <Typography
            level="body-md"
            sx={{ color: "primary.solidBg", fontWeight: "md" }}
          >
            support@cooperativebanknetwork.com
          </Typography>
        </Stack>
      </Sheet>
    </Box>
  );
};

export default Terms;
