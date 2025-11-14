import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  FormLabel,
  Input,
  Button,
  Table,
  Alert,
  Sheet,
  CircularProgress,
} from "@mui/joy";
import { loanAPI } from "../services/api";

const LoanStatusCheck = ({ onBack }) => {
  const [params, setParams] = useState({
    mobileNumber: "",
    aadharNumber: "",
  });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) =>
    setParams({ ...params, [e.target.name]: e.target.value });

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await loanAPI.searchApplicationsPublic(params);
      const data = res.data?.applications || []; //  handle response shape
      setResults(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Unable to fetch loan status.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Button
        variant="plain"
        color="neutral"
        onClick={onBack}
        sx={{ mb: 2 }}
      >
      
      </Button>

      <Card
        variant="outlined"
        sx={{
          maxWidth: 700,
          mx: "auto",
          borderRadius: "xl",
          boxShadow: "sm",
        }}
      >
        <CardContent>
          <Typography level="h4" mb={2}>
            Loan Status Check
          </Typography>

          {error && (
            <Alert color="danger" variant="soft" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            alignItems="flex-end"
            mb={3}
          >
            <Box sx={{ flex: 1 }}>
              <FormLabel>Mobile Number</FormLabel>
              <Input
                name="mobileNumber"
                value={params.mobileNumber}
                onChange={handleChange}
                variant="soft"
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <FormLabel>Aadhar Number</FormLabel>
              <Input
                name="aadharNumber"
                value={params.aadharNumber}
                onChange={handleChange}
                variant="soft"
              />
            </Box>
            <Button onClick={handleSearch} loading={loading}>
              Search
            </Button>
          </Stack>

          {loading && (
            <Box sx={{ textAlign: "center", mt: 2 }}>
              <CircularProgress />
            </Box>
          )}

          {!loading && results.length > 0 && (
            <Sheet
              variant="outlined"
              sx={{
                borderRadius: "lg",
                overflowX: "auto",
              }}
            >
              <Table hoverRow stickyHeader>
                <thead>
                  <tr>
                    <th>Application ID</th>
                    <th>Name</th>
                    <th>Mobile</th>
                    <th>Loan Type</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r) => (
                    <tr key={r.id}>
                      <td>{r.application_id}</td>
                      <td>{`${r.first_name} ${r.last_name}`}</td>
                      <td>{r.mobile_number}</td>
                      <td>{r.loan_type}</td>
                      <td>₹{r.loan_amount?.toLocaleString()}</td>
                      <td>
                        <Typography
                          color={
                            r.status === "Approved"
                              ? "success"
                              : r.status === "Pending"
                              ? "warning"
                              : "danger"
                          }
                        >
                          {r.status}
                        </Typography>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Sheet>
          )}

          {!loading && results.length === 0 && !error && (
            <Typography
              textAlign="center"
              sx={{ mt: 3 }}
              color="neutral"
            >
              No applications found.
            </Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default LoanStatusCheck;
