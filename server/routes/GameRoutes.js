const express = require("express");
const Game = require("../models/Game");
const authenticateJWT = require("../middlewares/AuthenticateJWT"); // Import the authentication middleware

const router = express.Router();

// POST route to create a new game
router.post("/", authenticateJWT, async (req, res) => {
  try {
    // Log the user ID for debugging purposes
    console.log("Authenticated user:", req.user); // This should show the decoded user object

    // Ensure the user is authenticated (additional check for req.user)
    if (!req.user || !req.user._id) {
      console.log("User is not authenticated or _id is missing");
      return res
        .status(401)
        .json({ success: false, message: "User not authenticated" });
    }

    const { gameName, gameDescription } = req.body;

    // Validate game name and description
    if (!gameName || !gameDescription) {
      return res.status(400).json({
        success: false,
        message: "Game name and description are required",
      });
    }

    // Create the game with the authenticated user's ID
    const newGame = new Game({
      user: req.user._id, // Use the user ID from the JWT
      gameName,
      gameDescription,
      assetMenus: [], // Empty array as default
    });

    // Save the new game to the database
    await newGame.save();

    res.status(201).json({
      success: true,
      message: "Game created successfully",
      game: newGame,
    });
  } catch (error) {
    console.error("Error creating game:", error);

    // Provide more detailed error message for debugging
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

// routes/gameRoutes.js
router.get("/games", authenticateJWT, async (req, res) => {
  try {
    const games = await Game.find({ user: req.user._id });
    const formattedGames = games.map((game) => ({
      id: game._id.toString(), // Convert ObjectId to string
      gameName: game.gameName,
      gameDescription: game.gameDescription,
      assetMenus: game.assetMenus,
    }));

    res.status(200).json({ success: true, games: formattedGames });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Fetch all games created by the authenticated user
router.get("/user", authenticateJWT, async (req, res) => {
  try {
    // Ensure the user is authenticated
    if (!req.user || !req.user.userId) {
      return res
        .status(401)
        .json({ success: false, message: "User not authenticated" });
    }

    // Find games by the authenticated user's ID
    const games = await Game.find({ user: req.user.userId });

    res.status(200).json({
      success: true,
      games,
    });
  } catch (error) {
    console.error("Error fetching games:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

router.put("/:id", authenticateJWT, async (req, res) => {
  const gameId = req.params.id;
  const { gameName, gameDescription } = req.body;

  try {
    // Find the game by ID and update its fields
    const game = await Game.findById(gameId);

    if (!game) {
      return res.status(404).json({
        success: false,
        message: "Game not found",
      });
    }

    // Ensure the user is the owner of the game (if needed)
    if (game.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to update this game",
      });
    }

    // Update game fields
    game.gameName = gameName || game.gameName;
    game.gameDescription = gameDescription || game.gameDescription;

    // Save the updated game
    await game.save();

    res.status(200).json({
      success: true,
      message: "Game updated successfully",
      game,
    });
  } catch (error) {
    console.error("Error updating game:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

module.exports = router;
