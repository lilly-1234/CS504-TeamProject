// Import dependencies
const express = require('express');
const speakeasy = require('speakeasy'); // For TOTP-based MFA
const qrcode = require('qrcode'); // To generate QR codes for Google Authenticator MFA
const jwt = require('jsonwebtoken'); // To create/verify JWT tokens
const bcrypt = require('bcrypt'); //bcrypt for password hashing
const User = require('../models/User'); // Mongoose User model
const router = express.Router();

// Fallback JWT secret in case it's missing in environment
const JWT_SECRET = process.env.JWT_SECRET || 'securenotes123';

const MFA_TIMEOUT = '2m';
const ACCESS_TOKEN_EXPIRY = '3m';
const SALT_ROUNDS = 10;

// Signup Route
router.post('/signup', async (req, res) => {
  const { username, password } = req.body;
  // Check if username already exists
  const existing = await User.findOne({ username });
  if (existing) return res.status(400).json({ message: 'User already exists' });

  // Hash the user's plain-text password using bcrypt with the defined number of salt rounds
  // 'SALT_ROUNDS': the cost factor; higher means more secure but slower 
  // 'hashedPassword': the resulting encrypted string to be safely stored in the database
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  // Generate a TOTP MFA secret for the user
  const secret = speakeasy.generateSecret({ name: `SecureNotes (${username})` });

  // Create and save the new user with MFA secret
  const user = new User({ username, password: hashedPassword, secret: secret.base32 });
  await user.save();

  // Generate QR code that can be scanned by MFA apps - Google Authenticator
  qrcode.toDataURL(secret.otpauth_url, (err, qrCode) => {
    if (err) return res.status(500).json({ message: 'QR code generation failed' });

    // Send QR code image data to frontend to display
    res.json({ qrCode });
  });
});

// VERIFY MFA SETUP Route (before login)
router.post('/verify-mfa-setup', async (req, res) => {
  const { username, token } = req.body;

  // Find user by username
  const user = await User.findOne({ username });
  if (!user) return res.status(400).json({ message: 'User not found' });

  // Verify TOTP token provided by user using their stored MFA secret
  const verified = speakeasy.totp.verify({
    secret: user.secret,
    encoding: 'base32',
    token
  });

  // Return whether the token is valid
  res.json({ verified });
});

// Login Route (password check only, no MFA)
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // Find user and check if password matches
  const user = await User.findOne({ username });
  // Check if the user exists in the database
  // If not found, return HTTP 401 (Unauthorized) with success: false
  if (!user) return res.status(401).json({ success: false });

  // Compare the plain-text password entered by the user with the hashed password stored in the database
  // 'bcrypt.compare' returns true if they match, false otherwise
  const match = await bcrypt.compare(password, user.password);

  // If the passwords don't match, return HTTP 401 (Unauthorized) with success: false
  if (!match) return res.status(401).json({ success: false });

  // Login succeeds, but token is issued only after MFA
  res.json({ success: true });
});

// Validate MFA token
router.get('/validate-mfa', (req, res) => {
  // Extract the MFA token from the custom request header
  const token = req.headers['x-mfa-token'];
  // If the token is missing, respond with 401 Unauthorized
  if (!token) return res.status(401).json({ valid: false });

  try {
    // Verify the token using JWT and your secret key
    jwt.verify(token, JWT_SECRET);
    return res.json({ valid: true });
  } catch {
    return res.status(401).json({ valid: false });
  }
});

// Skip MFA step if a valid MFA token exists
router.post('/skip-mfa-login', async (req, res) => {
  const { username, password, mfaToken } = req.body;

  // Check if the user exists in the databasev
  const user = await User.findOne({ username });
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  // Compare the provided password with the hashed password in the database
  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ message: 'Invalid credentials' });

  try {
    // Verify the provided MFA token
    const decoded = jwt.verify(mfaToken, JWT_SECRET);

    // Ensure that the token belongs to the same user and was generated after successful MFA
    if (decoded.username !== username || !decoded.mfaVerified)
      throw new Error("MFA token mismatch");

    // If all checks pass, generate a new access token for session authentication
    const accessToken = jwt.sign({ username, userId: user._id }, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
    return res.json({ token: accessToken, verified: true });

  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired MFA token' });
  }
});

// Verify MFA Token and Issue Access Token
router.post('/verify-mfa-login', async (req, res) => {
  const { username, token } = req.body;

  // Find user
  const user = await User.findOne({ username });
  if (!user) return res.status(400).json({ message: 'User not found' });

  // Verify TOTP token using speakeasy
  const verified = speakeasy.totp.verify({
    secret: user.secret,
    encoding: 'base32',
    token
  });

  // If MFA fails, return 401
  if (!verified)
    return res.status(401).json({ verified: false });

  // If MFA is successful, generate JWT and MFA token
  const jwtToken = jwt.sign({ username, userId: user._id }, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY }); // Payload, Secret, Token expiry
  const mfaToken = jwt.sign({ username, mfaVerified: true }, JWT_SECRET, { expiresIn: MFA_TIMEOUT });

  // Return JWT for authenticated access
  res.json({ verified: true, token: jwtToken, mfaToken });
});
// Route to re-built the qr code
router.get('/resend-qr/:username', async (req, res) => {
  const { username } = req.params;

  // Find the user in DB
  const user = await User.findOne({ username });
  if (!user) return res.status(404).json({ message: 'User not found' });

  // Reconstruct the otpauth URL using stored secret
  const otpauthUrl = `otpauth://totp/(${username})?secret=${user.secret}&issuer=SecureNotes`;

  // Convert URL to QR code image
  qrcode.toDataURL(otpauthUrl, (err, qrCode) => {
    if (err) return res.status(500).json({ message: 'Failed to generate QR code' });
    res.json({ qrCode });
  });
});

// Export the route handlers
module.exports = router;
