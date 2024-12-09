const express = require("express");
const router = express.Router();
const AssetMenu = require("../models/AssetMenu");
const mongoose = require("mongoose");

// Route to create a new asset menu for a specific game
router.post("/", async (req, res) => {
  try {
    const { title = "", position, assets, gameId } = req.body;

    if (!gameId) {
      return res.status(400).json({
        success: false,
        message: "gameId is required",
      });
    }

    // Default to "Untitled" if title is blank
    const newAssetMenu = new AssetMenu({
      title: title.trim() || "Untitled", // Default title if empty or whitespace
      position,
      assets,
      gameId,
    });

    await newAssetMenu.save();

    res.status(201).json({
      success: true,
      message: "Asset Menu created successfully",
      assetMenu: newAssetMenu,
    });
  } catch (error) {
    console.error("Error creating asset menu:", error); // Log the error for debugging
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

// Backend database fetch for asset menus (in the relevant route)
router.get("/", async (req, res) => {
  const { gameId } = req.query;
  try {
    const assetMenus = await AssetMenu.find({ gameId });

    res.json(assetMenus);
  } catch (error) {
    console.error("Error fetching asset menus:", error);
    res.status(500).json({ message: "Error fetching asset menus", error });
  }
});

// Endpoint to update position
router.put("/:id", async (req, res) => {
  try {
    const { top, left } = req.body.position;
    const updatedMenu = await AssetMenu.findByIdAndUpdate(
      req.params.id,
      { $set: { position: { top, left } } }, // Update only the position
      { new: true } // Return the updated document
    );
    res.json(updatedMenu);
  } catch (error) {
    res.status(500).json({ error: "Failed to update position" });
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

module.exports = router;
