import React from "react";
import {
  Box,
  Typography,
  Sheet,
  Divider,
  Stack,
  Chip,
} from "@mui/joy";
import { Shield, Eye, Lock, FileLock2 } from "lucide-react";

const Privacy = () => {
  const sections = [
    {
      title: "1. Introduction",
      text: `This Privacy Policy explains how the Cooperative Bank Network (“CBN”, “we”, “our”, or “us”) collects, uses, and protects your information when you use our platform. By accessing the service, you agree to this Policy.`,
    },
    {
      title: "2. Information We Collect",
      text: `We collect information that cooperative banks and credit societies submit, such as borrower identification, loan details, and institution contact data. We may also collect login metadata (IP address, browser type, access time) to ensure secure operations.`,
    },
    {
      title: "3. How We Use Information",
      text: `Collected data is used to verify borrowers’ existing loans, prevent loan fraud, maintain service integrity, and improve system performance. We do not sell or rent personal data to any third party.`,
    },
    {
      title: "4. Data Sharing & Access",
      text: `Information is shared only among verified and registered member institutions for legitimate loan verification purposes. No data is publicly available or accessible without proper authorization.`,
    },
    {
      title: "5. Data Security",
      text: `We implement encryption, secure authentication, and audit logs to protect information. However, no electronic system is completely secure, and users are encouraged to follow best security practices.`,
    },
    {
      title: "6. Data Retention",
      text: `Loan records and user data are retained only for as long as required to fulfill legitimate business or regulatory needs. Data may be archived securely for compliance purposes.`,
    },
    {
      title: "7. Your Rights",
      text: `Authorized institutions may request correction or removal of inaccurate data through our official support channel. Requests are subject to verification and regulatory constraints.`,
    },
    {
      title: "8. Updates to This Policy",
      text: `We may modify this Privacy Policy from time to time. Any material changes will be communicated through the platform dashboard or registered email.`,
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
          backgroundColor: "rgba(255, 255, 255, 0.85)",
          animation: "fadeIn 0.8s ease",
          "@keyframes fadeIn": {
            from: { opacity: 0, transform: "translateY(10px)" },
            to: { opacity: 1, transform: "translateY(0)" },
          },
        }}
      >
        {/* Header */}
        <Stack alignItems="center" spacing={1.5} sx={{ mb: 4 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
            }}
          >
            <Shield size={28} color="#1976d2" />
            <Typography level="h3" sx={{ color: "primary.plainColor" }}>
              Privacy Policy
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
                {index === 0 && <Eye size={18} color="#1976d2" />}
                {index === 4 && <Lock size={18} color="#1976d2" />}
                {index === 6 && <FileLock2 size={18} color="#1976d2" />}
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

        {/* Divider & Contact */}
        <Divider sx={{ my: 4 }} />
        <Stack spacing={0.5} alignItems="center">
          <Typography level="body-sm" sx={{ color: "text.secondary" }}>
            Questions or privacy-related requests?
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

export default Privacy;
