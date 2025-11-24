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
import { useNavigate } from "react-router-dom";

const LoanSearch = () => {
  const [query, setQuery] = useState("");
  const [detected, setDetected] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const detectInputType = (value) => {
    if (/^\d{12}$/.test(value)) return "Aadhaar Number";
    if (/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i.test(value)) return "PAN Number";
    if (/^\d{10}$/.test(value)) return "Mobile Number";
    return "";
  };

  const handleChange = (e) => {
    const val = e.target.value.toUpperCase();
    setQuery(val);
    setDetected(detectInputType(val));
  };

  const handleSearch = async () => {
    const type = detectInputType(query.trim());

    if (!type) {
      alert("Enter valid Aadhaar (12 digits) OR PAN (ABCDE1234F) OR Mobile (10 digits)");
      return;
    }

    const searchParams = { aadharNumber: "", panNumber: "", mobileNumber: "" };

    if (type === "Aadhaar Number") searchParams.aadharNumber = query.trim();
    if (type === "PAN Number") searchParams.panNumber = query.trim();
    if (type === "Mobile Number") searchParams.mobileNumber = query.trim();

    setLoading(true);

    try {
      const res = await loanAPI.searchApplications(searchParams);
      const list =
        Array.isArray(res) ? res : res?.applications || res?.data?.data || [];
      setResults(list || []);
    } catch (err) {
      console.error("Error fetching loan applications:", err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setQuery("");
    setDetected("");
    setResults([]);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography level="h4" fontWeight="lg" mb={3}>
        🏦 Search Loans
      </Typography>

      {/* SEARCH CARD */}
      <Card
        variant="outlined"
        sx={{
          borderRadius: "lg",
          boxShadow: "sm",
          p: 3,
          mb: 4,
          bgcolor: "background.body",
        }}
      >
        <CardContent sx={{ p: 0 }}>
          <Stack spacing={1.5} alignItems="center">
            {/* INPUT */}
            <Input
              placeholder="Enter Aadhaar / PAN / Mobile"
              value={query}
              onChange={handleChange}
              variant="soft"
              sx={{
                width: "280px",
                fontSize: "0.9rem",
                py: 1,
              }}
            />

            {/* AUTO DETECT LABEL */}
            <Typography
              level="body-sm"
              sx={{ minHeight: "18px" }}
              color={detected ? "success" : query ? "danger" : "neutral"}
            >
              {detected ? `Detected: ${detected}` : query ? "Invalid input" : ""}
            </Typography>

            {/* ACTION BUTTONS */}
            <Stack
              direction="row"
              spacing={2}
              justifyContent="center"
              sx={{ mt: 1.5 }}
            >
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

              <Button
                variant="plain"
                color="neutral"
                onClick={() => navigate("/dashboard")}
              >
                Back
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* RESULTS */}
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
          <Typography level="h5" mb={2}>
            Search Results
          </Typography>

          <Table
            stickyHeader
            borderAxis="both"
            hoverRow
            sx={{
              "--Table-headerUnderlineThickness": "1px",
              "--TableCell-headBackground":
                "var(--joy-palette-neutral-softBg)",
              borderRadius: "md",
              minWidth: 650,
            }}
          >
            <thead>
              <tr>
                <th>Full Name</th>
                <th>Mobile Number</th>
                <th>Loan Type</th>
                <th>Loan Amount</th>
                <th>Society</th>
                <th>Branch</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {results.map((app) => (
                <tr key={app.application_id || app.id}>
                  <td>{app.first_name} {app.last_name}</td>
                  <td>{app.mobile_number}</td>
                  <td>{app.loan_type}</td>
                  <td>₹{app.loan_amount?.toLocaleString()}</td>
                  <td>{app.society_name}</td>
                  <td>{app.branch_name}</td>
                  <td>
                    <Typography
                      level="body-sm"
                      fontWeight="lg"
                      color={
                        app.status === "Running"
                          ? "success"
                          : app.status === "Due"
                          ? "warning"
                          : ["Overdue", "Litigation"].includes(app.status)
                          ? "danger"
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
          No loans found.
        </Typography>
      )}
    </Box>
  );
};

export default LoanSearch;
