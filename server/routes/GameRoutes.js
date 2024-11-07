const express = require('express');
const Game = require('../models/Game');
const authenticateJWT = require('../middlewares/AuthenticateJWT'); // Import the authentication middleware

const router = express.Router();

// Create a new game (with authentication)
router.post('/', authenticateJWT, async (req, res) => {
  try {
    const { gameName, gameDescription, assetMenus } = req.body; // Correct variable names

    // Validate incoming data
    if (!gameName || !gameDescription) {
      return res.status(400).json({ success: false, message: "Game name or description is missing" });
    }

    // Initialize assetMenus as an empty array if not provided
    const newGame = new Game({
      user: req.user._id, // Assign the authenticated user's ID
      gameName: req.body.gameName,
      gameDescription: req.body.gameDescription,
      assetMenus: assetMenus || [], // Initialize as an empty array if assetMenus is not provided
    });

    await newGame.save();

    res.status(201).json({ success: true, message: "Game created successfully", game: newGame });
  } catch (error) {
    console.error("Error creating game:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
