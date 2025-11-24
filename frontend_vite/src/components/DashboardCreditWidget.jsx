import React from "react";
import { Card, CardContent, Typography, Button, Stack } from "@mui/joy";
import { BarChart } from "lucide-react";

/**
 * Lightweight dashboard widget: shows a prompt to check score.
 * Replace `score` prop later when fully integrated.
 */
const DashboardCreditWidget = ({ score = null, onOpen }) => {
  const getStatus = (s) => {
    if (s === null) return { label: "Unknown", color: "neutral" };
    if (s >= 750) return { label: "Excellent", color: "success" };
    if (s >= 650) return { label: "Good", color: "warning" };
    return { label: "Risky", color: "danger" };
  };

  const status = getStatus(score);

  return (
    <Card variant="outlined" sx={{ p: 2, borderRadius: "md" }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Stack spacing={0.5}>
          <Typography level="body-sm">Credit Score</Typography>
          <Typography level="h5" fontWeight={700}>
            {score === null ? "—" : score}
          </Typography>
          <Typography level="body-xs" color={`${status.color}.solidColor`}>
            {status.label}
          </Typography>
        </Stack>

        <Stack spacing={1} alignItems="flex-end">
          <BarChart />
          <Button size="sm" variant="soft" onClick={onOpen}>
            Check Score
          </Button>
        </Stack>
      </Stack>
    </Card>
  );
};

export default DashboardCreditWidget;
