const express = require("express");
const router = express.Router();
const { signup, login, getUser } = require("../controllers/Auth"); // Import all controller functions
const authenticateJWT = require("../middlewares/AuthenticateJWT");

// Signup route
router.post("/signup", signup);

// Login route
router.post("/login", login);

// Get user route (ensure authentication middleware is applied)
router.get("/user", authenticateJWT, getUser);

router.get("/games", authenticateJWT);

// Export the router
module.exports = router;
