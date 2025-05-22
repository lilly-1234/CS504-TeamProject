const authRoutes = require('./routes/authRoutes');
const express = require('express');
const cors = require('cors');
const connectDB = require('./dbconnection'); // Bring MongoDB connection function from db.js
require('dotenv').config();
<<<<<<< HEAD
=======
const notesRoutes = require("./routes/notesRoutes");
>>>>>>> f48bc3c (2FA added)

const app = express();

// Middleware
const domain = process.env.CODESPACE_NAME
  ? `https://${process.env.CODESPACE_NAME}-3000.app.github.dev` // Use Codespace URL for frontend
  : 'http://localhost:3000'; // Default to localhost for local development

// CORS configuration
const corsOptions = {
<<<<<<< HEAD
  origin: domain,  // Allow requests from frontend running in GitHub Codespace
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type'],
};

app.use(cors(corsOptions)); // Apply CORS middleware

app.use(express.json());
=======
  origin: ['http://localhost:3000'], //domain,  // Allow requests from frontend running in GitHub Codespace
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: '*',//['Content-Type'],
};

app.use(cors(corsOptions)); // Apply CORS middleware
app.use(express.json());

>>>>>>> f48bc3c (2FA added)
connectDB()

// Routes
app.use('/api/auth', authRoutes);
<<<<<<< HEAD
=======
app.use("/api/notes", notesRoutes); 
>>>>>>> f48bc3c (2FA added)

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
