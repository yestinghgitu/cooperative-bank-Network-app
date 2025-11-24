import React, { useState } from "react";
import { Box, Typography, Input, Select, Option, Button, Card, CardContent, Stack } from "@mui/joy";

/**
 * Simple calculator to estimate loan eligibility using CIBIL-like score heuristic.
 * Not a replacement for real credit decisioning.
 */
const LoanEligibilityCalculator = () => {
  const [score, setScore] = useState(700);
  const [income, setIncome] = useState(30000);
  const [existingEMI, setExistingEMI] = useState(0);
  const [tenureYears, setTenureYears] = useState(5);
  const [result, setResult] = useState(null);

  const calculate = () => {
    // Very simple rules for demo:
    // base LTV factor from score
    let scoreFactor = 0.5;
    if (score >= 750) scoreFactor = 1.1;
    else if (score >= 700) scoreFactor = 1.0;
    else if (score >= 650) scoreFactor = 0.8;
    else scoreFactor = 0.6;

    // disposable income approx = income - (existingEMI + 0.3*income)
    const disposable = income - existingEMI - 0.3 * income;
    const monthlyAffordable = Math.max(0, disposable);
    const maxLoanFromEMI = (monthlyAffordable * (1 - Math.pow(1 + 0.01, -tenureYears * 12))) / 0.01;

    // scale with score factor
    const estimatedLoan = Math.round(maxLoanFromEMI * scoreFactor);

    setResult({
      estimatedLoan,
      monthlyAffordable: Math.round(monthlyAffordable),
      message:
        score >= 650
          ? "Likely eligible — subject to verification"
          : "Low score — consider improving credit history",
    });
  };

  return (
    <Card variant="outlined" sx={{ maxWidth: 700 }}>
      <CardContent>
        <Typography level="h6" sx={{ mb: 2 }}>
          Loan Eligibility Calculator
        </Typography>

        <Stack spacing={2}>
          <Input
            value={score}
            onChange={(e) => setScore(Number(e.target.value))}
            type="number"
            placeholder="CIBIL-like score (300-900)"
            startDecorator="Score"
          />
          <Input
            value={income}
            onChange={(e) => setIncome(Number(e.target.value))}
            type="number"
            placeholder="Monthly net income"
            startDecorator="Income"
          />
          <Input
            value={existingEMI}
            onChange={(e) => setExistingEMI(Number(e.target.value))}
            type="number"
            placeholder="Existing monthly EMI"
            startDecorator="Existing EMI"
          />
          <Select value={tenureYears} onChange={(e, v) => setTenureYears(Number(v))}>
            {[1, 2, 3, 4, 5, 7, 10].map((y) => (
              <Option key={y} value={y}>
                {y} year{y > 1 ? "s" : ""}
              </Option>
            ))}
          </Select>

          <Button onClick={calculate}>Calculate</Button>

          {result && (
            <Box>
              <Typography>Estimated Loan: ₹{result.estimatedLoan.toLocaleString()}</Typography>
              <Typography>Monthly Affordable: ₹{result.monthlyAffordable.toLocaleString()}</Typography>
              <Typography color="warning">{result.message}</Typography>
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default LoanEligibilityCalculator;
