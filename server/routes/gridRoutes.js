const express = require("express");
const Grid = require("../models/Grid");
const authenticateJWT = require("../middlewares/AuthenticateJWT");
const router = express.Router();

// Create a new grid
router.post("/create", authenticateJWT, async (req, res) => {
  const { gameId, rows, columns, cellSize } = req.body;

  try {
    // Validate input
    if (!gameId) {
      return res.status(400).json({ message: "Game ID is required." });
    }
    if (!Number.isInteger(rows) || rows <= 0) {
      return res
        .status(400)
        .json({ message: "Rows must be a positive integer." });
    }
    if (!Number.isInteger(columns) || columns <= 0) {
      return res
        .status(400)
        .json({ message: "Columns must be a positive integer." });
    }
    if (!Number.isInteger(cellSize) || cellSize <= 0) {
      return res
        .status(400)
        .json({ message: "Cell size must be a positive integer." });
    }

    const newGrid = new Grid({
      gameId,
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

// Get all grids for a specific game
router.get("/", authenticateJWT, async (req, res) => {
  const { gameId } = req.query;

  if (!gameId) {
    return res
      .status(400)
      .json({ message: "Game ID is required to fetch grids." });
  }

  try {
    const grids = await Grid.find({ gameId });
    if (grids.length === 0) {
      return res.status(404).json({ message: "No grids found for this game." });
    }
    res.json({ grids, gridsFetched: true });
  } catch (err) {
    console.error("Failed to fetch grids:", err);
    res.status(500).json({ message: "Failed to fetch grids" });
  }
});

module.exports = router;
