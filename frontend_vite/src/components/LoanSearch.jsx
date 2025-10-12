import React, { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  Input,
  Button,
  Sheet,
  Table,
  CircularProgress,
} from "@mui/joy";
import { loanAPI } from "../services/api";
import { Search, RotateCcw } from "lucide-react";

const LoanSearch = ({ onBack }) => {
  const [searchParams, setSearchParams] = useState({
    aadharNumber: "",
    mobileNumber: "",
    firstName: "",
    lastName: "",
  });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setSearchParams({ ...searchParams, [e.target.name]: e.target.value });

  const handleSearch = async () => {
    setLoading(true);
    try {
      const res = await loanAPI.searchApplicationsPublic(searchParams);
      console.log("📦 Raw API response:", res);

      // 🧩 Normalize response: handle both { applications: [...] } and raw arrays
      const list =
        Array.isArray(res) ? res : res?.applications || res?.data?.applications || [];

      console.log(" Normalized list:", list);
      setResults(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error(" Error fetching loan applications:", err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSearchParams({
      aadharNumber: "",
      mobileNumber: "",
      firstName: "",
      lastName: "",
    });
    setResults([]);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography level="h4" fontWeight="lg" mb={2}>
        Search Loan Applications
      </Typography>

      {/* SEARCH CARD */}
      <Card
        variant="outlined"
        sx={{
          borderRadius: "lg",
          boxShadow: "sm",
          p: 3,
          mb: 3,
          bgcolor: "background.body",
        }}
      >
        <CardContent>
          <Stack spacing={2}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <Input
                placeholder="Aadhar Number"
                name="aadharNumber"
                value={searchParams.aadharNumber}
                onChange={handleChange}
                variant="soft"
              />
              <Input
                placeholder="Mobile Number"
                name="mobileNumber"
                value={searchParams.mobileNumber}
                onChange={handleChange}
                variant="soft"
              />
            </Stack>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <Input
                placeholder="First Name"
                name="firstName"
                value={searchParams.firstName}
                onChange={handleChange}
                variant="soft"
              />
              <Input
                placeholder="Last Name"
                name="lastName"
                value={searchParams.lastName}
                onChange={handleChange}
                variant="soft"
              />
            </Stack>

            <Stack direction="row" spacing={2} justifyContent="center" mt={1}>
              <Button
                onClick={handleSearch}
                startDecorator={<Search size={18} />}
                loading={loading}
                variant="solid"
                color="primary"
              >
                Search
              </Button>
              <Button
                onClick={handleReset}
                startDecorator={<RotateCcw size={18} />}
                variant="soft"
                color="neutral"
              >
                Reset
              </Button>
              <Button variant="plain" color="neutral" onClick={onBack}>
                Back
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* RESULTS TABLE */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress size="lg" />
        </Box>
      ) : results.length > 0 ? (
        <Sheet
          variant="outlined"
          sx={{
            p: 2,
            borderRadius: "lg",
            boxShadow: "sm",
            overflowX: "auto",
            bgcolor: "background.surface",
          }}
        >
          <Typography level="h5" mb={1}>
            Search Results
          </Typography>

          <Table
            stickyHeader
            borderAxis="both"
            hoverRow
            sx={{
              "--Table-headerUnderlineThickness": "1px",
              "--TableCell-headBackground": "var(--joy-palette-neutral-softBg)",
              borderRadius: "md",
              minWidth: 650,
            }}
          >
            <thead>
              <tr>
                <th style={{ textAlign: "left" }}>Application ID</th>
                <th>Full Name</th>
                <th>Mobile Number</th>
                <th>Loan Type</th>
                <th>Loan Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {results.map((app) => (
                <tr key={app.application_id || app.id}>
                  <td>{app.application_id}</td>
                  <td>
                    {app.first_name} {app.last_name}
                  </td>
                  <td>{app.mobile_number}</td>
                  <td>{app.loan_type}</td>
                  <td>₹{app.loan_amount?.toLocaleString()}</td>
                  <td>
                    <Typography
                      level="body-sm"
                      fontWeight="lg"
                      color={
                        app.status === "Approved"
                          ? "success"
                          : app.status === "Pending"
                          ? "warning"
                          : "neutral"
                      }
                    >
                      {app.status}
                    </Typography>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Sheet>
      ) : (
        <Typography
          level="body-md"
          textAlign="center"
          color="neutral"
          sx={{ mt: 3 }}
        >
          No applications found.
        </Typography>
      )}
    </Box>
  );
};

export default LoanSearch;
