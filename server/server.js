require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const gameRoutes = require("./routes/GameRoutes");
const authenticateJWT = require("./middlewares/AuthenticateJWT"); // JWT auth middleware
const authRoutes = require("./routes/authRoutes"); // Correct import for auth routes
const User = require("./models/UserModel"); // Import the User model
const assetMenuRoutes = require("./routes/assetMenuRoutes");
const multer = require("multer");

const { MONGO_URL, PORT } = process.env;

// Set up file storage with Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // You can change the folder where assets will be stored
    const uploadDir = path.join(__dirname, "uploads", "assets");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filenames
  },
});

mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });

const app = express();

// CORS middleware
const corsOptions = {
  origin: "http://localhost:5173", // Your frontend URL
  credentials: true, // Allow credentials (like cookies) if needed
};
app.use(cors(corsOptions));

// Middleware setup
app.use(cookieParser());
app.use(express.json());

// Auth routes
app.use("/api/auth", authRoutes); // Use the auth routes at /api/auth

// Game-related routes should be protected
app.use("/api/games", authenticateJWT, gameRoutes); // Game routes are now protected
app.use("/api/games/:gameId/assetMenus", authenticateJWT, assetMenuRoutes);

// User fetch route
app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find(); // Fetch all users from the database
    res.json(users); // Return the users as JSON
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching users", error: err.message });
  }
});

// Default error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(500)
    .json({ message: "Internal server error", error: err.message });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
