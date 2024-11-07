// routes/Auth.js

const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/UserModel'); // Assuming UserModel exists in models folder
const router = express.Router();

// Secret for JWT - Make sure to use environment variable for production
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret'; 

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate incoming data
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Please provide both email and password" });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Validate password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ success: false, message: "Invalid password" });
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id, username: user.username }, // Include user info in the token
      JWT_SECRET,
      { expiresIn: '1h' } // Token expires in 1 hour
    );

    // Send token in response or set in cookie
    res.cookie('token', token, {
      httpOnly: true,  // Make sure cookie is accessible only from the server
      secure: process.env.NODE_ENV === 'production',  // Ensure cookie is secure in production
      sameSite: 'strict', // To prevent CSRF attacks
    });

    // Return the token and success message
    return res.json({ success: true, message: "Login successful", token }); // Send token in the response body
    
  } catch (error) {
    console.error("Error during login:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

module.exports = router;
