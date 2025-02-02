const express = require("express");
const router = express.Router();
const AssetMenu = require("../models/AssetMenu");
const mongoose = require("mongoose");

// Route to create a new asset menu for a specific game
router.post("/", async (req, res) => {
  try {
    const { title = "", position, assets, gameId } = req.body;

    // Validate gameId
    if (!gameId || !mongoose.Types.ObjectId.isValid(gameId)) {
      return res.status(400).json({
        success: false,
        message: "Valid gameId is required",
      });
    }

    // Default to "Untitled" if title is blank
    const newAssetMenu = new AssetMenu({
      id: `menu-${Date.now()}`, // Ensure the ID is unique
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

// Fetch asset menus based on gameId
router.get("/", async (req, res) => {
  const { gameId } = req.query;
  try {
    // Validate gameId format
    if (!gameId || !mongoose.Types.ObjectId.isValid(gameId)) {
      return res.status(400).json({
        success: false,
        message: "Valid gameId is required",
      });
    }

    // Ensure position has valid numbers in MongoDB
    const assetMenus = await AssetMenu.find();
    assetMenus.forEach(async (menu) => {
      if (
        !menu.position ||
        typeof menu.position.top !== "number" ||
        typeof menu.position.left !== "number"
      ) {
        menu.position = { top: 100, left: 100 };
        await menu.save();
      }
    });

    res.json({
      success: true,
      assetMenus,
    });
  } catch (error) {
    console.error("Error fetching asset menus:", error);
    res
      .status(500)
      .json({ success: false, message: "Error fetching asset menus", error });
  }
});

// Fetch an AssetMenu by ID (for update or to display details)
router.get("/:id", async (req, res) => {
  try {
    const assetMenu = await AssetMenu.findById(req.params.id);
    if (!assetMenu) {
      return res.status(404).json({ message: "AssetMenu not found" });
    }

    res.json({ assetMenu });
  } catch (err) {
    console.error("Error fetching AssetMenu:", err);
    res
      .status(500)
      .json({ message: "Error fetching AssetMenu", error: err.message });
  }
});

// Endpoint to update position of an AssetMenu
router.put("/:id", async (req, res) => {
  try {
    const { top, left } = req.body.position;

    if (top === undefined || left === undefined) {
      return res.status(400).json({
        success: false,
        message: "Position with 'top' and 'left' values is required",
      });
    }

    const updatedMenu = await AssetMenu.findByIdAndUpdate(
      req.params.id,
      { $set: { position: { top, left } } }, // Update only the position
      { new: true } // Return the updated document
    );
    if (!updatedMenu) {
      return res.status(404).json({ message: "AssetMenu not found" });
    }

    res.json({
      success: true,
      message: "AssetMenu position updated",
      assetMenu: updatedMenu,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, error: "Failed to update position" });
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

// PUT /api/assetMenus/positions
// router.put("/positions", async (req, res) => {
//   const { positions } = req.body; // positions: array of { _id, position }
//   try {
//     await Promise.all(
//       positions.map(async (pos) => {
//         await AssetMenu.updateOne(
//           { _id: pos._id },
//           { $set: { position: pos.position } }
//         );
//       })
//     );
//     res.json({ success: true });
//   } catch (error) {
//     console.error("Error updating positions:", error);
//     res.status(500).json({ error: "Failed to update positions" });
//   }
// });

router.put("/:id/position", async (req, res) => {
  const { id } = req.params;
  const { top, left } = req.body;

  if (top === undefined || left === undefined) {
    return res
      .status(400)
      .json({ error: "Both 'top' and 'left' are required" });
  }

  try {
    const updatedMenu = await AssetMenu.findByIdAndUpdate(
      id,
      { $set: { position: { top, left } } },
      { new: true } // Return updated document
    );

    if (!updatedMenu) {
      return res.status(404).json({ error: "AssetMenu not found" });
    }

    res.json({ success: true, assetMenu: updatedMenu });
  } catch (error) {
    console.error("Error updating position:", error);
    res.status(500).json({ error: "Failed to update position" });
  }
});

module.exports = router;
