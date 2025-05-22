import { useState } from "react";
import {
  Box, Container, Card, CardContent, Typography, FormControl,
  TextField, FormHelperText, CardActions, Button, Stack, Snackbar
} from '@mui/material';
import { useNavigate, Link } from "react-router-dom";
import AppLogo from "../Logo/AppLogo.png";
import "./Page.css";
import API_BASE_URL from "../config";

// Component for Signup page
export default function Signup() {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });
  const [errors, setErrors] = useState({ userName: false, password: false, confirmPassword: false });

  const navigate = useNavigate(); // For redirecting to login after signup


  const handleSignupClick = async () => {
    const hasError = !userName || !password || password !== confirmPassword;

    setErrors({
      userName: !userName,
      password: !password,
      confirmPassword: !confirmPassword || password !== confirmPassword,
    });

    if (hasError) {
      setSnackbar({ open: true, message: "Please fill in all fields correctly." });
    } else {
      try {
        const response = await fetch(`${API_BASE_URL}/signup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: userName, email: userName, password }),
        });
        const data = await response.json();

        if (response.ok) {
          setSnackbar({ open: true, message: "Signup successful! Redirecting to login..." });
          setTimeout(() => navigate("/dashboard"), 1000);
        } else {
          setSnackbar({ open: true, message: data.message });
        }
      } catch (error) {
        setSnackbar({ open: true, message: "Error signing up" });
        console.log(error)
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
              <Typography variant="h5">Sign Up</Typography>

              {/* Username input with error validation */}
              <FormControl fullWidth error={errors.userName}>
                <TextField
                  label="Username"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                />
                {errors.userName && <FormHelperText>Username is required.</FormHelperText>}
              </FormControl>

               {/* Password input with error validation */}
              <FormControl fullWidth error={errors.password}>
                <TextField
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {errors.password && <FormHelperText>Password is required.</FormHelperText>}
              </FormControl>
              
               {/* Confirm password input with error validation */}
              <FormControl fullWidth error={errors.confirmPassword}>
                <TextField
                  label="Confirm Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                {errors.confirmPassword && <FormHelperText>Passwords must match.</FormHelperText>}
              </FormControl>
            </Stack>
          </CardContent>

          {/* Submit button */}
          <CardActions className="card-actions">
            <Button variant="contained" fullWidth onClick={handleSignupClick}>
              Sign Up
            </Button>
          </CardActions>
          
          {/* Redirect to login if already have an account */}
          <Box>
            <Typography variant="body2">
              Already have an account? <Link to="/login">Login here</Link>
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
