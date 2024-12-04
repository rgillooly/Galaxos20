const express = require("express");
const router = express.Router();
const User = require("../models/User"); // Example user model

router.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(409)
        .json({ success: false, message: "Email is already registered" });
    }

    // Create a new user
    const newUser = new User({ username, email, password }); // Add hashing here if needed
    await newUser.save();

    res
      .status(201)
      .json({ success: true, message: "User created successfully" });
  } catch (error) {
    console.error("Error during signup:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Error signing up, please try again later.",
      });
  }
});

module.exports = router;
