import { useState } from "react";
import {
  Box, Container, Card, CardContent, Typography, FormControl,
  TextField, FormHelperText, CardActions, Button, Stack, Snackbar
} from '@mui/material';
import { useNavigate, Link } from "react-router-dom";
import AppLogo from "../Logo/AppLogo.png";
import "./Page.css";

// Component for Signup page
export default function Signup() {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });
  const [errors, setErrors] = useState({ userName: false, password: false, confirmPassword: false });

  const navigate = useNavigate(); // For redirecting to login after signup

  // Handles signup button click
  const handleSignupClick = () => {
    
    // Check if either field is empty
    const hasError = !userName || !password || password !== confirmPassword;
    
    // Set error messages for each field
    setErrors({
      userName: !userName,
      password: !password,
      confirmPassword: !confirmPassword || password !== confirmPassword
    });

    // Show error message if fields are incomplete
    if (hasError) {
      setSnackbar({ open: true, message: "Please fill in all fields correctly." });
    } else {
      setSnackbar({ open: true, message: "Signup success! Redirecting to login..." });
      
      //Delay before navigation
      setTimeout(() => navigate("/login"), 1500);
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
