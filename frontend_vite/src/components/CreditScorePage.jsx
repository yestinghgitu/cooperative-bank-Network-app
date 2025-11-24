import React from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Stack,
  Divider,
} from "@mui/joy";

const providers = [
  {
    id: "cibil",
    name: "TransUnion CIBIL",
    free: true,
    urlFree: "https://www.cibil.com/freecibilscore",
    urlPaid: "https://www.cibil.com/creditscore",
    desc: "India's most widely used consumer credit bureau. Free score lookup and paid full report.",
  },
  {
    id: "experian",
    name: "Experian India",
    free: true,
    urlFree: "https://www.experian.in/consumer/credit-report",
    urlPaid: "https://www.experian.in/consumer/credit-report-and-score",
    desc: "Experian consumer credit score and credit report options.",
  },
  {
    id: "crif",
    name: "CRIF High Mark",
    free: true,
    urlFree: "https://www.crifhighmark.com/consumer/credit-score-check",
    urlPaid: "https://www.crifhighmark.com/consumer/credit-score-check/get-your-credit-score",
    desc: "CRIF High Mark consumer credit score and full report.",
  },
  {
    id: "equifax",
    name: "Equifax India",
    free: true,
    urlFree: "https://cir.equifax.co.in/enequifaxweb/enquire.action",
    urlPaid: "https://cir.equifax.co.in/enequifaxweb/creditscore.action",
    desc: "Equifax CIR portal (India).",
  },
];

const CreditScorePage = () => {
  const open = (url) => window.open(url, "_blank", "noopener");

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1100, mx: "auto" }}>
      <Typography level="h3" fontWeight="lg" sx={{ mb: 2, textAlign: "center" }}>
        Check Your Credit Score & Reports
      </Typography>

      <Typography level="body-md" sx={{ mb: 3, color: "text.tertiary" }}>
        You can check credit scores instantly via official bureau portals. For full integration (fetching scores inside CoNetX),
        we'll need to onboard with a bureau (CIBIL / Experian / CRIF) and implement consent + secure API calls.
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {providers.map((p) => (
          <Grid key={p.id} xs={12} sm={6} md={3}>
            <Card variant="outlined" sx={{ height: "100%" }}>
              <CardContent>
                <Typography fontWeight={700}>{p.name}</Typography>
                <Typography level="body-sm" sx={{ mt: 0.5, mb: 1 }}>
                  {p.desc}
                </Typography>
                <Stack spacing={1} direction="column" sx={{ mt: 1 }}>
                  <Button onClick={() => open(p.urlFree)} variant="soft">
                    Check Free Score
                  </Button>
                  <Button onClick={() => open(p.urlPaid)} variant="outlined">
                    Get Full Report (Paid)
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Divider sx={{ my: 3 }} />

      <Box>
        <Typography level="h5" sx={{ mb: 1 }}>
          How it works (quick)
        </Typography>
        <ol>
          <li>Users click a provider link; they complete verification on the provider site (PAN / OTP / eKYC).</li>
          <li>Provider returns the score and PDF to the user — no personal data leaves the provider unless user consents.</li>
          <li>For embedded integration later: CoNetX will present a consent flow, call the bureau API, store only metadata + masked identifiers, and keep the PDF encrypted.</li>
        </ol>
      </Box>

      <Divider sx={{ my: 3 }} />

      <Box>
        <Typography level="h5">Credit Score Ranges (guide)</Typography>
        <Box sx={{ display: "flex", gap: 1, mt: 1, flexWrap: "wrap" }}>
          <Button variant="soft" color="success">750+ Excellent</Button>
          <Button variant="soft" color="warning">650–749 Good</Button>
          <Button variant="soft" color="danger">650 Risky</Button>
        </Box>
      </Box>

      <Divider sx={{ my: 3 }} />

      <Box sx={{ mt: 2 }}>
        <Typography level="h6">Need help integrating?</Typography>
        <Typography level="body-sm" sx={{ color: "text.tertiary" }}>
          When you're ready I can build the consent UI and backend integration — including secure storage and audit logs.
        </Typography>
      </Box>
    </Box>
  );
};

export default CreditScorePage;
