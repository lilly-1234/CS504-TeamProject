import { useState, useEffect } from "react";
import {
  Box, Container, Card, CardContent, Typography, FormControl,
  TextField, FormHelperText, CardActions, Button, Stack, Snackbar
} from '@mui/material';
import { useNavigate, Link} from "react-router-dom";
import AppLogo from "../Logo/AppLogo.png";
import "./Page.css";

// Destructuring the props
export default function Login({ setIsAuthenticated, setUserId }) {
  const API_BASE = process.env.REACT_APP_API_URL;
  // State variables to store user inputs and steps
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [step, setStep] = useState(1);  // Steps in the login process (1 - login , 2 - MFA)
  const [errors, setErrors] = useState({ userName: false, password: false, token: false });
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });
  const navigate = useNavigate(); // Hook to navigate after login

  // Handles the initial login step (username + password)
  const handleLoginClick = async () => {
    // Set errors if fields are empty
    setErrors({ userName: !userName, password: !password, token: false });

    if (!userName || !password) {
      setSnackbar({ open: true, message: "Please fill in all required fields." });
      return;
    }

    try {
      // Step 1: Validate username and password
      const loginRes = await fetch(`${API_BASE}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: userName, password }),
      });

      const loginData = await loginRes.json();
      if (!loginData.success) {
        setSnackbar({ open: true, message: "Invalid username or password" });
        return;
      }

      // Step 2: Check if a valid mfaToken is already stored
      const mfaToken = localStorage.getItem("mfaToken");
      if (mfaToken) {
        const validateRes = await fetch(`${API_BASE}/api/validate-mfa`, {
          headers: { "x-mfa-token": mfaToken },
        });
        const validateData = await validateRes.json();

        if (validateData.valid) {
          // Step 3: If MFA token is valid, skip MFA step and get new access token
          const skipRes = await fetch(`${API_BASE}/api/skip-mfa-login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: userName, password, mfaToken }),
          });

          const skipData = await skipRes.json();
          if (skipData.verified && skipData.token) {
            localStorage.setItem("token", skipData.token);
            localStorage.setItem("user", userName);

            setIsAuthenticated?.(true);
            setUserId?.(userName);
            navigate("/dashboard");
            return;
          } else {
            // If MFA token is rejected, fall back to manual MFA step
            localStorage.removeItem("mfaToken");
          }
        } else {
          // Remove expired or invalid token
          localStorage.removeItem("mfaToken");
        }
      }

      // Step 4: No valid mfaToken — move to step 2 for manual TOTP entry
      setStep(2);

    } catch (err) {
      console.error("Login error:", err);
      setSnackbar({ open: true, message: "Server error during login" });
    }
  };

  // Handles the MFA token verification step
  const handleVerifyToken = async () => {
    if (!token) {
      setErrors(prev => ({ ...prev, token: true }));
      setSnackbar({ open: true, message: "Enter your 6-digit code" });
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/verify-mfa-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: userName, token }),
      });

      const result = await res.json();
      if (result.verified && result.token && result.mfaToken) {
        localStorage.setItem("token", result.token); // Store Access token
        localStorage.setItem("mfaToken", result.mfaToken); // store MFA session token 
        localStorage.setItem("user", userName);

        setIsAuthenticated?.(true);
        setUserId?.(userName);
        navigate("/dashboard");
      } else {
        setSnackbar({ open: true, message: "Invalid MFA code" });
      }
    } catch (err) {
      setSnackbar({ open: true, message: "Error verifying MFA" });
    }
  };

  // Function to handle Close snackbar message
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  useEffect(() => {
    // Retrieve stored MFA session token and username from localStorage
    const mfaToken = localStorage.getItem("mfaToken");
    const user = localStorage.getItem("user");
    
    // Proceed only if both the MFA token and user exist in localStorage
    if (mfaToken && user) {
      // Send request to the backend to validate the MFA session token
      fetch(`${API_BASE}/api/validate-mfa`, {
        headers: { "x-mfa-token": mfaToken }
      })
        .then(res => res.json())
        .then(data => {
          // If the token is still valid, skip MFA step by staying on step 1
          if (data.valid) {
            setStep(1);
          } else {
            // If token is invalid or expired, remove it from storage
            localStorage.removeItem("mfaToken");
          }
        })
        
        // If there's a network/server error, also clear the MFA token to avoid broken logic
        .catch(() => {
          localStorage.removeItem("mfaToken");
        });
    }
  }, []);


  return (
    <Box className="page-container">
      <Container maxWidth="xs">
        <Card className="page-card">
          <CardContent>
            <Stack direction="column" spacing={2} alignItems="center">
              <Box className="logo-container">
                <img src={AppLogo} alt="App Logo" className="logo-image" />
              </Box>
              <Typography variant="h6" gutterBottom>
                {step === 1 ? "Login" : "Enter MFA Code"}
              </Typography>

              {step === 1 ? (
                <>
                  <FormControl fullWidth error={errors.userName}>
                    <TextField label="Username Or Email" value={userName}
                      onChange={(e) => setUserName(e.target.value)} />
                    {errors.userName && <FormHelperText>Username is required</FormHelperText>}
                  </FormControl>

                  <FormControl fullWidth error={errors.password}>
                    <TextField label="Password" type="password" value={password}
                      onChange={(e) => setPassword(e.target.value)} />
                    {errors.password && <FormHelperText>Password is required</FormHelperText>}
                  </FormControl>
                </>
              ) : (
                <>
                  <FormControl fullWidth error={errors.token}>
                    <TextField label="6-digit code from Google Authenticator" value={token}
                      onChange={(e) => setToken(e.target.value)} />
                    {errors.token && <FormHelperText>Token is required</FormHelperText>}
                  </FormControl>
                </>
              )}
            </Stack>
          </CardContent>

          <CardActions className="card-actions">
            {step === 1 ? (
              <Button variant="contained" color="primary" onClick={handleLoginClick}>
                Login
              </Button>
            ) : (
              <Button variant="contained" color="secondary" onClick={handleVerifyToken}>
                Verify MFA
              </Button>
            )}
          </CardActions>
          <Box textAlign="center" width="100%" mt={1} mb={2}>
            <Typography variant="body2">
              Don't have an account? <Link to="/">Signup here</Link>
            </Typography>
          </Box>
        </Card>
      </Container>

      {/* Snackbar for user messages */}
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        message={snackbar.message}
      />
    </Box>
  );
}