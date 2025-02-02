const express = require("express");
const authenticateJWT = require("../middlewares/AuthenticateJWT");
const router = express.Router();
const mongoose = require("mongoose");
const Grid = require("../models/Grid");

// Create a new grid
router.post("/create", authenticateJWT, async (req, res) => {
  const { gameId, rows, columns, cellSize } = req.body;

  try {
    if (!gameId || !mongoose.Types.ObjectId.isValid(gameId)) {
      return res.status(400).json({ message: "Invalid Game ID." });
    }

    const newGrid = new Grid({
      gameId: new mongoose.Types.ObjectId(gameId),
      rows,
      columns,
      cellSize,
    });

    await newGrid.save();
    res
      .status(201)
      .json({ message: "Grid created successfully", grid: newGrid });
  } catch (err) {
    console.error("Error adding grid:", err);
    res.status(500).json({ message: "Failed to add grid" });
  }
});

// Fetch grids by gameId
router.get("/", async (req, res) => {
  const { gameId } = req.query;

  try {
    if (!gameId || !mongoose.Types.ObjectId.isValid(gameId)) {
      return res.status(400).json({
        success: false,
        message: "Valid gameId is required",
      });
    }

    const snapGrids = await Grid.find({ gameId });

    for (const grid of snapGrids) {
      if (
        !grid.position ||
        typeof grid.position.top !== "number" ||
        typeof grid.position.left !== "number"
      ) {
        grid.position = { top: 100, left: 100 };
        await grid.save();
      }
    }

    res.json({ success: true, snapGrids });
  } catch (error) {
    console.error("Error fetching grids:", error);
    res
      .status(500)
      .json({ success: false, message: "Error fetching grids", error });
  }
});

// Fetch an grid by ID (for update or to display details)
router.get("/:id", async (req, res) => {
  try {
    const grid = await Grid.findById(req.params.id);
    if (!grid) {
      return res.status(404).json({ message: "Grid not found" });
    }

    res.json({ grid });
  } catch (err) {
    console.error("Error fetching grid:", err);
    res
      .status(500)
      .json({ message: "Error fetching grid", error: err.message });
  }
});

// Fetch assets for a specific grid
router.get("/:id/assets", authenticateJWT, async (req, res) => {
  const { id } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Grid ID format." });
    }

    const grid = await Grid.findById(id).populate("assets");

    if (!grid) {
      return res.status(404).json({ message: "Grid not found." });
    }

    res.json(grid.assets);
  } catch (error) {
    console.error("Error fetching assets:", error);
    res.status(500).json({ message: "Failed to fetch assets" });
  }
});

router.put("/:id/position", async (req, res) => {
  const { id } = req.params;
  const { top, left } = req.body.position; // Accessing position.top and position.left

  if (top === undefined || left === undefined) {
    return res
      .status(400)
      .json({ error: "Both 'top' and 'left' are required" });
  }

  try {
    const updatedGrid = await Grid.findByIdAndUpdate(
      id,
      { $set: { position: { top, left } } },
      { new: true }
    );

    if (!updatedGrid) {
      return res.status(404).json({ error: "Grid not found" });
    }

    res.json({ success: true, snapGrid: updatedGrid });
  } catch (error) {
    console.error("Error updating position:", error);
    res.status(500).json({ error: "Failed to update position" });
  }
});

module.exports = router;
