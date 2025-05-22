import { useState, useEffect } from "react";
import { Box, Container, Card, CardContent, Typography, Button, Snackbar } from "@mui/material";
import { useNavigate } from "react-router-dom";
import "./Page.css";
import API_BASE_URL from "../config";

export default function MFASetup({ userId }) {
  const [qrCode, setQrCode] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });
  const navigate = useNavigate();

  // Fetch QR code for MFA setup
  useEffect(() => {
    const fetchQRCode = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/mfa/generate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        });
        const data = await response.json();
        if (response.ok) {
          setQrCode(data.qrCode);
        } else {
          setSnackbar({ open: true, message: data.message });
        }
      } catch (error) {
        setSnackbar({ open: true, message: "Error fetching QR code" });
      }
    };

    fetchQRCode();
  }, [userId]);

  // Handle MFA verification
  const handleVerifyMFA = async () => {
    try {
      const response = await fetch(`/api/auth/mfa/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, token: prompt("Enter the MFA code from your app:") }),
      });
      const data = await response.json();
      if (response.ok) {
        setSnackbar({ open: true, message: "MFA setup complete! Redirecting..." });
        setTimeout(() => navigate("/dashboard"), 1000);
      } else {
        setSnackbar({ open: true, message: data.message });
      }
    } catch (error) {
      setSnackbar({ open: true, message: "Error verifying MFA" });
    }
  };

  return (
    <Box className="page-container">
      <Container maxWidth="xs">
        <Card className="page-card">
          <CardContent>
            <Typography variant="h5" align="center">Set Up Two-Factor Authentication</Typography>
            <Typography variant="body2" align="center" style={{ margin: "16px 0" }}>
              Scan the QR code below with your authenticator app.
            </Typography>
            {qrCode && <img src={qrCode} alt="MFA QR Code" style={{ width: "100%" }} />}
          </CardContent>
          <Button variant="contained" fullWidth onClick={handleVerifyMFA}>
            Verify MFA
          </Button>
        </Card>
      </Container>
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
    </Box>
  );
}