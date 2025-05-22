const bcrypt = require('bcryptjs');
const User = require('../models/User'); 
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const  qRCode = require('qrcode');

exports.signup = async (req, res) => {
    try{
        const { name, email, password } = req.body;

        // 1. Check if user emal already exists
        const existingUser = await User.findOne({ email:email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already in use.' });
        }

        // 2. Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 3. Create new user
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
        });
        await newUser.save(); // Save and put into the database

        // 4. Generate JWT with 10-minute expiration
        const token = jwt.sign(
            { userId: newUser._id, email: newUser.email },
            process.env.JWT_SECRET,
            { expiresIn: '10m' } // token will expire in 10 minutes
        );

        // 5. Return user info and token
        res.status(201).json({
            message: 'User created successfully',
            user: {
            id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            },
            token,
        });

    }catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({ message: "Server error" });
      }
};

// exports.login = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     // 1. Check if user exists
//     const user = await User.findOne({ email });
//     if (!user) return res.status(404).json({ message: 'Wrong username or password' });
    
//     // 2. Compare password
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) return res.status(401).json({ message: 'Wrong username or password' });

//     // 3. Generate JWT
//     const token = jwt.sign(
//       { userId: user._id, email: user.email },
//       process.env.JWT_SECRET,
//       { expiresIn: '1h' } // token expires in 1 hour
//     );

//     // 4. Return token + user info
//     res.status(200).json({
//       message: 'Login successful',
//       token,
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email
//       }
//     });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

exports.login = async (req, res) => {
  try {
      const { email, password, token } = req.body;

      // Step 1: Authenticate user with email and password
      const user = await User.findOne({ email });
      if (!user || !(await bcrypt.compare(password, user.password))) {
          return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Step 2: If MFA is enabled, verify the TOTP code
      if (user.totpSecret) {
          const isVerified = speakeasy.totp.verify({
              secret: user.totpSecret,
              encoding: 'base32',
              token,
          });

          if (!isVerified) {
              return res.status(400).json({ message: 'Invalid MFA code' });
          }
      }

      // Step 3: Generate JWT token
      const jwtToken = jwt.sign(
          { userId: user._id, email: user.email },
          process.env.JWT_SECRET,
          { expiresIn: '10m' }
      );

      res.status(200).json({ 
        token: jwtToken, 
        message: 'Login successful',
        mfaRequired: true,
        userId: user._id,
       });
  } catch (error) {
      res.status(500).json({ message: 'Error logging in', error });
  }
};

exports.generateMFASecret = async (req, res) => {
    try {
        const user = await User.findOne(req.userId); // Ensure user is authenticated
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Generate TOTP secret
        const secret = speakeasy.generateSecret({ name: 'Cu25C504T1' });

        // Save the secret to the user's record
        user.totpSecret = secret.base32;
        await user.save();

        // Generate QR code for Google Authenticator
        const qrCode = await qRCode.toDataURL(secret.otpauth_url);

        res.status(200).json({ qrCode, message: 'Scan this QR code with Google Authenticator' });
    } catch (error) {
        res.status(500).json({ message: 'Error generating MFA secret', error });
        console.log(error)
    }
};

exports.verifyMFA = async (req, res) => {
  try {
      const { token } = req.body; // TOTP code from the user
      const user = await User.findById(req.userId); // Ensure user is authenticated
      if (!user) return res.status(404).json({ message: 'User not found' });

      // Verify the TOTP code
      const isVerified = speakeasy.totp.verify({
          secret: user.totpSecret,
          encoding: 'base32',
          token,
      });

      if (isVerified) {
          res.status(200).json({ message: 'MFA verified successfully' });
      } else {
          res.status(400).json({ message: 'Invalid MFA code' });
      }
  } catch (error) {
      res.status(500).json({ message: 'Error verifying MFA', error });
  }
};