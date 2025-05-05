const bcrypt = require('bcryptjs');
const User = require('../models/User'); 
const jwt = require('jsonwebtoken');

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

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Check if user exists
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'Wrong username or password' });
    
    // 2. Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Wrong username or password' });

    // 3. Generate JWT
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' } // token expires in 1 hour
    );

    // 4. Return token + user info
    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

