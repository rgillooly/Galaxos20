const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const gameRoutes = require("./routes/GameRoutes");
const authRoutes = require("./routes/Auth"); // Assuming Auth.js handles auth routes
const authenticate = require("./middlewares/Authenticate"); // Authentication middleware

const Game = require("./models/Game");
const User = require("./models/UserModel"); // Ensure User model is correctly imported

const { MONGO_URL, PORT } = process.env;

mongoose
  .connect(MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB is connected successfully"))
  .catch((err) => console.error(err));

const app = express();

// Middleware setup
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? 'https://yourfrontenddomain.com' : 'http://localhost:3000',
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true, // Allow cookies to be sent with requests
}));

app.use(cookieParser());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes); // Authentication routes
app.use("/api/games", gameRoutes); // Game routes

app.get("/api/games", async (req, res) => {
  try {
    const games = await Game.find();
    res.json(games);
  } catch (err) {
    res.status(500).json({ message: "Error fetching games", error: err.message });
  }
});

// Example user route
app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Error fetching users", error: err.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
