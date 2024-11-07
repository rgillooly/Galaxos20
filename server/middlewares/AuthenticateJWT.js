const jwt = require("jsonwebtoken");
const User = require("../models/UserModel"); // Make sure User model is correctly imported

// JWT Authentication middleware
const authenticateJWT = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1]; // Get token from Authorization header

  if (!token) {
    return res.status(401).json({ success: false, message: "No token provided" });
  }

  jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret", async (err, decoded) => {
    if (err) {
      return res.status(403).json({ success: false, message: "Invalid token" });
    }

    // Attach user info to the request object
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    req.user = user; // Attach the user object to the request
    next(); // Proceed to the next middleware or route handler
  });
};

module.exports = authenticateJWT;
