import { Box, Button, Typography, Stack } from "@mui/joy";

const CreditScoreLinks = () => {
  const openLink = (url) => window.open(url, "_blank");

  return (
    <Box sx={{ p: 3, maxWidth: 700, mx: "auto" }}>
      <Typography level="h3" textAlign="center" mb={3}>
        Check Your Credit Score
      </Typography>

      <Stack spacing={2}>
        <Button onClick={() => openLink("https://www.cibil.com/freecibilscore")} color="primary">
          Check Free CIBIL Score
        </Button>
        <Button onClick={() => openLink("https://www.cibil.com/creditscore")} variant="outlined">
          Buy Full CIBIL Report
        </Button>

        <Button onClick={() => openLink("https://www.experian.in/consumer/credit-report")} color="neutral">
          Check Free Experian Score
        </Button>

        <Button onClick={() => openLink("https://www.crifhighmark.com/consumer/credit-score-check")} color="success">
          Check Free CRIF Score
        </Button>

        <Button onClick={() => openLink("https://cir.equifax.co.in/enequifaxweb/enquire.action")} color="warning">
          Check Equifax Credit Report
        </Button>
      </Stack>
    </Box>
  );
};

export default CreditScoreLinks;
