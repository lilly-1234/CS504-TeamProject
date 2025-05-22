import { useState } from "react";
import {
  Box, Container, Card, CardContent, Typography, FormControl,
  TextField, FormHelperText, CardActions, Button, Stack, Snackbar
} from '@mui/material';
import { useNavigate, Link } from "react-router-dom";
import AppLogo from "../Logo/AppLogo.png";
import "./Page.css";
import API_BASE_URL from "../config";

export default function Login({ setIsAuthenticated, setUserId }) {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ userName: false, password: false });
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });
  const navigate = useNavigate();

  // Handles login button click
const handleLoginClick = async () => {
  const hasError = !userName || !password;
  setErrors({ userName: !userName, password: !password });

  if (hasError) {
    setSnackbar({ open: true, message: "Please fill in all required fields." });
  } else {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userName, password }),
      });
      const data = await response.json();

      if (response.ok) {
        if (data.mfaRequired) {
          navigate("/mfa-setup", { state: { userId: data.userId } });
        } else {
          setSnackbar({ open: true, message: "Login successful! Redirecting..." });
          setTimeout(() => navigate("/dashboard"), 1500);
        }
      } else {
        setSnackbar({ open: true, message: data.message });
      }
    } catch (error) {
      setSnackbar({ open: true, message: "Error logging in" });
    }
  }
};

  return (
    <Box className="page-container">
      <Container maxWidth="xs">
        <Card className="page-card">
          <CardContent>
            {/* App logo */}
            <Stack spacing={2} alignItems="center">
              <Box className="logo-container">
                <img src={AppLogo} alt="App Logo" className="logo-image" />
              </Box>
              
              {/* Page heading */}
              <Typography variant="h5">Login</Typography>
              
              {/* Username input with error validation */}
              <FormControl fullWidth error={errors.userName}>
                <TextField
                  label="Username"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                />
                {errors.userName && (
                  <FormHelperText>Username is required.</FormHelperText>
                )}
              </FormControl>
              
              {/* Password input with error validation */}
              <FormControl fullWidth error={errors.password}>
                <TextField
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {errors.password && (
                  <FormHelperText>Password is required.</FormHelperText>
                )}
              </FormControl>
            </Stack>
          </CardContent>

          {/* Login button */}
          <CardActions className="card-actions">
            <Button variant="contained" fullWidth onClick={handleLoginClick}>
              Login
            </Button>
          </CardActions>

          {/* Link to signup page if user doesn’t have an account */}
          <Box >
            <Typography variant="body2">
              Don’t have an account? <Link to="/">Sign up here</Link>
            </Typography>
          </Box>
        </Card>
      </Container>

      {/* Snackbar for success or error messages */}
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
    </Box>
  );
}
