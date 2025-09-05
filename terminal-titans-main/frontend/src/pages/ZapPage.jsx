import React, { useState } from "react";
import { Box, Typography, TextField, Button, RadioGroup, FormControlLabel, Radio, CircularProgress, Alert } from "@mui/material";

export default function ZapPage() {
  const [target, setTarget] = useState("");
  const [scanType, setScanType] = useState("spider"); // Add scan type selector
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState("");

  const handleScan = async () => {
    setLoading(true);
    setScanResult(null);
    setError("");
    try {
      const resp = await fetch("/api/zap-scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target, type: scanType }),
      });
      const result = await resp.json();
      if (resp.ok) {
        setScanResult(result);
      } else {
        setError(result.error || "Error running ZAP scan");
      }
    } catch (err) {
      setError("Network error or ZAP service not available.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", bgcolor: "#222", p: 4, borderRadius: 3, boxShadow: 3 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        ZAPROXY Scan
      </Typography>
      <TextField
        label="Target URL"
        fullWidth
        variant="outlined"
        value={target}
        onChange={e => setTarget(e.target.value)}
        sx={{ mb: 3 }}
      />
      <RadioGroup
        row
        value={scanType}
        onChange={e => setScanType(e.target.value)}
        sx={{ mb: 3 }}
      >
        <FormControlLabel value="spider" control={<Radio />} label="Spider Scan" />
        <FormControlLabel value="active" control={<Radio />} label="Active Scan" />
      </RadioGroup>
      <Button
        variant="contained"
        color="primary"
        onClick={handleScan}
        disabled={loading || !target}
        sx={{ mb: 2 }}
      >
        {loading ? <CircularProgress size={24} /> : "Start ZAP Scan"}
      </Button>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {scanResult && (
        <Box sx={{ mt: 3, bgcolor: "#111", p: 2, borderRadius: 2 }}>
          <Typography variant="h6">Scan Results</Typography>
          <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", color: "#fff" }}>
            {JSON.stringify(scanResult, null, 2)}
          </pre>
        </Box>
      )}
    </Box>
  );
}