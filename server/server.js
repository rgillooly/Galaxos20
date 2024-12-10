require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const gameRoutes = require("./routes/GameRoutes");
const authenticateJWT = require("./middlewares/AuthenticateJWT"); // JWT auth middleware
const authRoutes = require("./routes/authRoutes"); // Correct import for auth routes
const assetMenuRoutes = require("./routes/assetMenuRoutes");
const gridRoutes = require("./routes/gridRoutes"); // Ensure you're importing the correct routes file
const assetRoutes = require("./routes/assetRoutes");
const multer = require("multer");
const path = require("path");
const fs = require("fs").promises; // Use promises for async handling

const { MONGO_URL, PORT } = process.env;

// Set up file storage with Multer
const createUploadDir = async (uploadDir) => {
  try {
    await fs.mkdir(uploadDir, { recursive: true });
  } catch (err) {
    console.error("Error creating upload directory:", err);
  }
};

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, "uploads", "assets");
    await createUploadDir(uploadDir); // Ensure the directory exists
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filenames
  },
});

// Connect to MongoDB
mongoose
  .connect(MONGO_URL, {
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
  methods: "GET,POST,PUT,DELETE",
  allowedHeaders: "Content-Type,Authorization",
};
app.use(cors(corsOptions)); // Apply the correct CORS options

// Middleware setup
app.use(cookieParser());
app.use(express.json());

// Auth routes
app.use("/api/auth", authRoutes); // Use the auth routes at /api/auth

// Game-related routes should be protected
app.use("/api/games", authenticateJWT, gameRoutes); // Game routes are now protected

// Only this route should be used for asset menus associated with a specific game
app.use("/api/games/:gameId/assetMenus", authenticateJWT, assetMenuRoutes);

// General asset menus (not tied to any specific game)
app.use("/api/assetMenus", authenticateJWT, assetMenuRoutes);

// Asset-related routes
app.use("/api/assets", authenticateJWT, assetRoutes); // Asset routes should be prefixed correctly

// Include grid routes
app.use("/api/grids", authenticateJWT, gridRoutes); // Ensure the grid routes are correctly defined

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// User fetch route (Example)
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
