const express = require("express");
const router = express.Router();
const AssetMenu = require("../models/AssetMenu"); // Assuming you have a model for AssetMenu
const authenticateJWT = require("../middlewares/AuthenticateJWT");

// POST endpoint to create a new AssetMenu
router.post("/:gameId", authenticateJWT, async (req, res) => {
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

    const { title, position, assets } = req.body; // Get data from request body

    // Validate title and position
    if (!title || !position) {
      return res.status(400).json({
        success: false,
        message: "Title and position are required",
      });
    }

    // Create the new asset menu for the given gameId
    const newAssetMenu = new AssetMenu({
      gameId: req.params.gameId, // Get the gameId from the route params
      title,
      position,
      assets: assets || [], // Use the assets array from the body, or default to empty
    });

    // Save the new asset menu to the database
    await newAssetMenu.save();

    res.status(201).json({
      success: true,
      message: "Asset Menu created successfully",
      assetMenu: newAssetMenu, // Return the newly created AssetMenu
    });
  } catch (error) {
    console.error("Error creating asset menu:", error);

    // Provide more detailed error message for debugging
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

module.exports = router;
