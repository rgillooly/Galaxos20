const express = require("express");
const router = express.Router();
const AssetMenu = require("../models/Assetmenu"); // Ensure the model name matches
const authenticateJWT = require("../middlewares/AuthenticateJWT");

router.post("/", async (req, res) => {
  try {
    const { title, position, assets, gameId } = req.body;

    // Validate input
    if (!gameId || !title || !position) {
      return res.status(400).json({
        success: false,
        message: "gameId, title, and position are required",
      });
    }

    // Create the new AssetMenu
    const newAssetMenu = new AssetMenu({
      gameId,
      title,
      position,
      assets,
    });

    await newAssetMenu.save();

    res.status(201).json({
      success: true,
      message: "Asset Menu created successfully",
      assetMenu: newAssetMenu,
    });
  } catch (error) {
    console.error("Error creating asset menu:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

router.get('/api/assetMenus', async (req, res) => {
  const { gameId } = req.query; // Get the gameId from the query parameter

  try {
    const assetMenus = await AssetMenu.find({ gameId }); // Find asset menus by gameId
    res.json(assetMenus);
  } catch (error) {
    console.error("Error fetching asset menus:", error);
    res.status(500).json({ error: "Failed to fetch asset menus" });
  }
});

// Fetch asset menus for a specific game
router.get("/", async (req, res) => {
  const { gameId } = req.query;
  try {
    const assetMenus = await AssetMenu.find({ gameId: gameId });
    res.json(assetMenus);
  } catch (error) {
    res.status(500).json({ message: "Error fetching asset menus", error });
  }
});

// Create a new asset menu for a specific game
router.post("/", async (req, res) => {
  const { gameId } = req.params;
  const { title, position, assets } = req.body;
  try {
    const newAssetMenu = new AssetMenu({ title, position, assets, gameId });
    await newAssetMenu.save();
    res.json(newAssetMenu);
  } catch (err) {
    res.status(500).json({ message: "Error creating asset menu", error: err.message });
  }
});

router.put('/api/asset-menus/:id', async (req, res) => {
  try {
    const { _id } = req.params;
    const { title } = req.body;

    // Find the asset menu by ID and update the title
    const updatedMenu = await AssetMenu.findByIdAndUpdate(_id, { title }, { new: true });

    if (!updatedMenu) {
      return res.status(404).send('Asset menu not found');
    }

    res.json(updatedMenu);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;

    // Validate input
    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Title is required",
      });
    }

    // Find the asset menu by ID and update the title
    const updatedMenu = await AssetMenu.findByIdAndUpdate(id, { title }, { new: true });

    if (!updatedMenu) {
      return res.status(404).json({
        success: false,
        message: "Asset menu not found",
      });
    }

    res.json({
      success: true,
      message: "Asset menu updated successfully",
      assetMenu: updatedMenu,
    });
  } catch (error) {
    console.error("Error updating asset menu:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

module.exports = router;
