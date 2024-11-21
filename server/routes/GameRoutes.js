const express = require("express");
const Game = require("../models/Game");
const authenticateJWT = require("../middlewares/AuthenticateJWT"); // Import the authentication middleware
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;

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
    if (!req.user || !req.user._id) {
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

router.get("/api/games/:_id", async (req, res) => {
  try {
    const game = await Game.findById(req.params._id);
    if (!game) {
      return res
        .status(404)
        .json({ success: false, message: "Game not found" });
    }
    res.status(200).json({ success: true, game });
  } catch (error) {
    console.error("Error fetching game:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Title update route should be placed after to avoid route conflicts
router.put("/title-update/:id", async (req, res) => {
  const { id } = req.params; // Extract the ID from the URL params
  const { title } = req.body; // Get the new title from the request body

  console.log("Updating title for ID:", id); // Log the incoming request for debugging

  // Validate ObjectId format
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid ID format" });
  }

  // Validate the title (make sure it's not empty)
  if (!title || title.trim() === "") {
    return res.status(400).json({ message: "Title cannot be empty" });
  }

  try {
    const assetMenu = await AssetMenu.findById(id);
    if (!assetMenu) {
      return res.status(404).json({ message: "AssetMenu not found" });
    }

    // Update only the title field with the received title
    assetMenu.title = title.trim(); // Ensure the title is trimmed of spaces
    await assetMenu.save();

    console.log("Updated AssetMenu:", assetMenu); // Log the updated asset menu

    res.status(200).json({
      success: true,
      message: "Asset menu title updated successfully",
      assetMenu,
    });
  } catch (error) {
    console.error("Error updating AssetMenu:", error);
    res.status(500).json({ message: "Error updating AssetMenu", error });
  }
});

// Route to update game description
router.put("/:gameId/description", authenticateJWT, async (req, res) => {
  const { gameId } = req.params;
  const { description } = req.body;

  console.log(`Attempting to update game description for Game ID: ${gameId}`);

  // Validate gameId format
  if (!mongoose.Types.ObjectId.isValid(gameId)) {
    return res.status(400).json({ message: "Invalid game ID format" });
  }

  // Ensure description is not empty
  if (!description || description.trim() === "") {
    return res.status(400).json({ message: "Description cannot be empty" });
  }

  try {
    // Find the game by its ID and verify ownership
    const game = await Game.findById(gameId);
    if (!game) {
      console.log(`Game not found with ID: ${gameId}`);
      return res.status(404).json({ message: "Game not found" });
    }

    // Optional: Verify that the logged-in user is the owner
    if (game.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this game",
      });
    }

    // Update the game description
    game.gameDescription = description.trim();
    await game.save();

    console.log("Updated game description:", game.gameDescription);

    // Return the updated game
    res.status(200).json({ success: true, game });
  } catch (err) {
    console.error("Error updating game description:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Other routes (make sure they come after the description route)
// router.put("/games/:gameId", async (req, res) => {
//   const { gameId } = req.params;
//   const { gameName } = req.body;

//   // Handle updating game name
//   const updatedGame = await Game.findByIdAndUpdate(
//     gameId,
//     { gameName },
//     { new: true }
//   );
//   if (!updatedGame) {
//     return res.status(404).json({ success: false, message: "Game not found" });
//   }
//   res.status(200).json({ success: true, game: updatedGame });
// });

module.exports = router;
