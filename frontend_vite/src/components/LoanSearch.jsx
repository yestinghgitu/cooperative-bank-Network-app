import React, { useState } from "react";
import {
  Box,
  Typography,
  Card,
  Stack,
  Input,
  Button,
  CircularProgress,
  Chip,
  Sheet,
  Divider,
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
      alert(
        "Enter valid Aadhaar (12 digits) OR PAN (ABCDE1234F) OR Mobile (10 digits)"
      );
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

  const statusColor = (status) => {
    if (status === "Running") return "success";
    if (status === "Due") return "warning";
    if (["Overdue", "Litigation"].includes(status)) return "danger";
    return "neutral";
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Typography level="h4" fontWeight="lg" mb={3} textAlign="center">
        🏦 Loan Search and Verification
      </Typography>

      {/* SEARCH CARD */}
      <Card variant="outlined" sx={{ borderRadius: "lg", p: { xs: 2, md: 3 }, mb: 4 }}>
        <Stack spacing={1.5} alignItems="center">
          <Input
            placeholder="Enter Aadhaar / PAN / Mobile"
            value={query}
            onChange={handleChange}
            variant="soft"
            sx={{ width: { xs: "100%", sm: 320 }, fontSize: "0.95rem", py: 1 }}
          />
          <Typography
            level="body-sm"
            sx={{ minHeight: 20 }}
            color={detected ? "success" : query ? "danger" : "neutral"}
          >
            {detected ? `Detected: ${detected}` : query ? "Invalid input" : ""}
          </Typography>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            justifyContent="center"
            mt={1.5}
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

            <Button variant="plain" color="neutral" onClick={() => navigate("/dashboard")}>
              Back
            </Button>
          </Stack>
        </Stack>
      </Card>

      {/* RESULTS */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress size="lg" />
        </Box>
      ) : results.length > 0 ? (
        <Stack spacing={2}>
          {results.map((app) => (
            <Card
              key={app.application_id || app.id}
              variant="outlined"
              sx={{
                borderRadius: "lg",
                p: 2,
                transition: "0.3s",
                "&:hover": { boxShadow: "md" },
              }}
            >
              <Stack spacing={1}>
                {/* HEADER */}
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  flexWrap="wrap"
                >
                  <Typography level="h6" fontWeight="lg">
                    {app.first_name} {app.last_name}
                  </Typography>
                  <Chip color={statusColor(app.status)} size="sm" variant="soft">
                    {app.status}
                  </Chip>
                </Stack>

                {/* BASIC DETAILS */}
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2} flexWrap="wrap">
                  <Typography level="body-sm">
                    Mobile: <a href={`tel:+91${app.mobile_number}`}>{app.mobile_number}</a>
                  </Typography>
                  <Typography level="body-sm">Loan Type: {app.loan_type}</Typography>
                  <Typography level="body-sm">
                    Amount: <strong>₹{app.loan_amount?.toLocaleString()}</strong>
                  </Typography>
                  <Typography level="body-sm">Society: {app.society_name}</Typography>
                  <Typography level="body-sm">Branch: {app.branch_name}</Typography>
                </Stack>

                {/* Uncomment later for detailed CIBIL/loan info */}
{/*                 
                <Sheet variant="outlined" sx={{ mt: 1, p: 1, borderRadius: "sm" }}>
                  <Divider sx={{ my: 1 }} />
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={2} flexWrap="wrap">
                    <Typography level="body-xs" sx={{ flex: 1 }}>
                      CIBIL Score: <strong>{app.cibil_score || "N/A"}</strong>
                    </Typography>
                    <Typography level="body-xs" sx={{ flex: 1 }}>
                      Outstanding Balance: ₹{app.outstanding_balance?.toLocaleString() || 0}
                    </Typography>
                    <Typography level="body-xs" sx={{ flex: 1 }}>
                      Last Payment Date: {app.last_payment_date || "-"}
                    </Typography>
                    <Typography level="body-xs" sx={{ flex: 1 }}>
                      Tenure: {app.tenure || "-"} months
                    </Typography>
                  </Stack>
                </Sheet>
                */}
              </Stack>
            </Card>
          ))}
        </Stack>
      ) : (
        <Typography level="body-md" textAlign="center" color="neutral" sx={{ mt: 3 }}>
          No loans found.
        </Typography>
      )}
    </Box>
  );
};

export default LoanSearch;
