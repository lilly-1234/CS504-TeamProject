import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SignupPage from './components/Signup';
import LoginPage from './components/Login';
//import Dashboard from './components/Dashboard';

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Route for the default path ("/") which renders the Signup page */}
        <Route path="/" element={<SignupPage />} />
        
        {/* Route for the login path ("/login") which renders the Login page */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* Future route for the dashboard — currently commented out */}
        {/* <Route path="/dashboard" element={<Dashboard />} /> */}
      </Routes>
    </Router>
  );
};

export default App;