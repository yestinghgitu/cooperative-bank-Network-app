// src/components/CreditCheck.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  Typography,
  Button,
  Sheet,
  CircularProgress,
  Divider,
  Chip,
  Modal,
  ModalDialog,
  Input,
  FormControl,
  Stack,
  IconButton,
} from "@mui/joy";
import { creditAPI } from "../services/api";
import { toast } from "sonner";
import { Download, ShieldCheck, FileCheck, Gauge, Send, Check } from "lucide-react";

const CreditGauge = ({ score = 0 }) => {
  const maxScore = 900;
  const percentage = Math.max(0, Math.min(100, (score / maxScore) * 100));

  const scoreColor =
    score >= 750 ? "#16a34a" :
    score >= 650 ? "#eab308" :
    score >= 550 ? "#f97316" :
    "#ef4444";

  return (
    <Box sx={{ width: "100%", textAlign: "center", py: 3 }}>
      <Box sx={{ width: 200, height: 200, mx: "auto", position: "relative" }}>
        <svg viewBox="0 0 36 36" width="200" height="200">
          <path
            d="M18 2.0845
               a 15.9155 15.9155 0 0 1 0 31.831
               a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="#eee"
            strokeWidth="2.5"
          />
          <path
            d="M18 2.0845
               a 15.9155 15.9155 0 0 1 0 31.831"
            fill="none"
            stroke={scoreColor}
            strokeWidth="2.5"
            strokeDasharray={`${percentage} ${100 - percentage}`}
            strokeLinecap="round"
            style={{ transition: "stroke-dasharray 1s ease" }}
          />
          <g transform="translate(18,18)">
            <text x="0" y="4" textAnchor="middle" fontSize="6" fontWeight="700" fill={scoreColor}>
              {score}
            </text>
          </g>
        </svg>
      </Box>

      <Typography level="body-md" sx={{ mt: 1, color: scoreColor }}>
        {score >= 750 ? "Excellent" : score >= 650 ? "Good" : score >= 550 ? "Fair" : "Poor"}
      </Typography>
    </Box>
  );
};

const CreditCheck = () => {
  const [consentGiven, setConsentGiven] = useState(false);
  const [consentId, setConsentId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState(null);
  const [reportId, setReportId] = useState(null);

  // OTP flow controls
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [mobile, setMobile] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [otp, setOtp] = useState("");
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  // Save consent
  const handleConsent = async () => {
    try {
      const res = await creditAPI.saveConsent({
        provider: "cibil",
        consent_text: "User consents to fetch credit score/report for lending and verification.",
      });
      setConsentId(res.data.consent_id);
      setConsentGiven(true);
      toast.success("Consent saved.");
    } catch (err) {
      toast.error("Failed to save consent.");
    }
  };

  // Start OTP flow (mock)
  const handleSendOtp = async () => {
    if (!mobile || mobile.length < 6) return toast.error("Enter valid mobile");
    setOtpSending(true);
    try {
      const res = await creditAPI.sendMockOtp({ mobile });
      setSessionId(res.data.session_id);
      setOtpModalOpen(true);
      toast.success("OTP sent (mock). Check backend logs.");
    } catch (err) {
      toast.error("Failed to send OTP");
    } finally {
      setOtpSending(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!sessionId || !otp) return toast.error("Enter OTP");
    setOtpVerifying(true);
    try {
      await creditAPI.verifyMockOtp({ session_id: sessionId, otp });
      setOtpVerified(true);
      setOtpModalOpen(false);
      toast.success("OTP verified");
    } catch (err) {
      toast.error("OTP verification failed");
    } finally {
      setOtpVerifying(false);
    }
  };

  // Request mock score
  const handleFetchScore = async () => {
    if (!consentId) return toast.error("Please give consent first");
    setLoading(true);
    try {
      const payload = { provider: "cibil", consent_id: consentId, pan: "" };
      // attach OTP session if verified (simulating secure verification)
      if (otpVerified) payload.session_id = sessionId, payload.otp_verified = true;

      const res = await creditAPI.requestScore(payload);
      setScore(res.data.score);
      setReportId(res.data.report_id);
      toast.success("Score fetched (mock)");
    } catch (err) {
      toast.error("Failed to fetch score");
    } finally {
      setLoading(false);
    }
  };

const handleDownload = async () => {
  if (!reportId) return toast.error("No report available");

  try {
    const response = await creditAPI.downloadReport(reportId);

    const blob = new Blob([response.data], { type: "application/pdf" });

    let filename = `credit_report_${reportId}.pdf`;

    const header = response.headers["content-disposition"];
    if (header) {
      const match = header.match(/filename="?(.+)"?/);
      if (match) filename = match[1];
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);

  } catch (err) {
    console.error("Download error:", err);
    toast.error("Failed to download report");
  }
};



  return (
    <Box sx={{ maxWidth: 920, mx: "auto", mt: 6, p: 2 }}>
      <Typography level="h2" sx={{ mb: 3, fontWeight: 700, textAlign: "center" }}>
        Credit Check (Mock Bureau)
      </Typography>

      <Sheet variant="soft" sx={{ p: 3, borderRadius: "lg" }}>
        {/* Consent area */}
        {!consentGiven ? (
          <Card variant="outlined" sx={{ p: 3, textAlign: "center" }}>
            <ShieldCheck size={34} />
            <Typography level="h4" sx={{ mt: 2 }}>
              Consent required
            </Typography>
            <Typography sx={{ mt: 1, color: "text.tertiary" }}>
              We need your consent to fetch credit report from the bureau. This is a mock flow.
            </Typography>
            <Button sx={{ mt: 3 }} size="lg" onClick={handleConsent} startDecorator={<FileCheck />}>
              Give Consent
            </Button>
          </Card>
        ) : (
          <>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "360px 1fr" }, gap: 3 }}>
              <Card variant="outlined" sx={{ p: 2 }}>
                <Typography level="body-lg" fontWeight={700}>Verification</Typography>
                <Typography level="body-sm" sx={{ color: "text.tertiary", mt: 1 }}>
                  Verify applicant mobile to proceed (mock OTP).
                </Typography>

                <FormControl sx={{ mt: 2 }}>
                  <Input
                    placeholder="Mobile (e.g., 98XXXXXXXX)"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    startDecorator={<Send />}
                  />
                </FormControl>

                <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                  <Button onClick={handleSendOtp} disabled={otpSending} startDecorator={<Send />}>
                    {otpSending ? <CircularProgress size="sm" /> : "Send OTP"}
                  </Button>
                  <Button variant={otpVerified ? "solid" : "outlined"} color={otpVerified ? "success" : "neutral"} onClick={() => setOtpModalOpen(true)}>
                    {otpVerified ? "Verified" : "Enter OTP"}
                  </Button>
                </Stack>

                <Divider sx={{ my: 2 }} />

                <Typography level="body-sm" sx={{ color: "text.tertiary" }}>
                  Once verified you can fetch a mock credit score and download a simulated report.
                </Typography>

                <Button
                  size="lg"
                  color="primary"
                  sx={{ mt: 3, width: "100%" }}
                  onClick={handleFetchScore}
                  disabled={loading}
                  startDecorator={<Gauge />}
                >
                  {loading ? <CircularProgress size="sm" /> : "Fetch Score (Mock)"}
                </Button>

                {score && (
                  <Button variant="soft" sx={{ mt: 2 }} onClick={handleDownload} startDecorator={<Download />}>
                    Download Report (PDF)
                  </Button>
                )}
              </Card>

              <Card variant="outlined" sx={{ p: 2 }}>
                <Typography level="body-lg" fontWeight={700}>Result</Typography>
                <Divider sx={{ my: 1 }} />
                {loading ? (
                  <Box sx={{ textAlign: "center", py: 6 }}>
                    <CircularProgress size="lg" />
                    <Typography sx={{ mt: 2 }}>Fetching...</Typography>
                  </Box>
                ) : score ? (
                  <>
                    <CreditGauge score={score} />
                    <Box sx={{ textAlign: "center", mt: 2 }}>
                      <Chip size="lg" color={ score >= 750 ? "success" : score >= 650 ? "warning" : "danger" }>
                        Score: {score}
                      </Chip>
                    </Box>
                    <Box sx={{ mt: 2 }}>
                      <Typography level="body-sm" sx={{ color: "text.tertiary" }}>
                        This is a mocked score for development. Replace mock endpoints with real bureau calls in production.
                      </Typography>
                    </Box>
                  </>
                ) : (
                  <Box sx={{ textAlign: "center", py: 6 }}>
                    <Typography level="body-md" sx={{ color: "text.tertiary" }}>
                      No score yet — give consent, verify mobile (OTP) and fetch.
                    </Typography>
                  </Box>
                )}
              </Card>
            </Box>
          </>
        )}
      </Sheet>

      {/* OTP Modal */}
      <Modal open={otpModalOpen} onClose={() => setOtpModalOpen(false)}>
        <ModalDialog>
          <Typography level="h5">Enter OTP</Typography>
          <Typography level="body-sm" sx={{ color: "text.tertiary", mb: 2 }}>
            Enter the 6-digit OTP that was (mock) sent to {mobile}
          </Typography>
          <FormControl>
            <Input placeholder="OTP" value={otp} onChange={(e) => setOtp(e.target.value)} />
          </FormControl>
          <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
            <Button variant="outlined" onClick={() => setOtpModalOpen(false)}>Cancel</Button>
            <Button onClick={handleVerifyOtp} startDecorator={<Check />} disabled={otpVerifying}>
              {otpVerifying ? <CircularProgress size="sm" /> : "Verify"}
            </Button>
          </Stack>
        </ModalDialog>
      </Modal>

    </Box>
  );
};

export default CreditCheck;
