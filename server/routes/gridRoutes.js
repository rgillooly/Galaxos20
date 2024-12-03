const express = require("express");
const Grid = require("../models/Grid"); // Assuming you have a Grid model
const authenticateJWT = require("../middlewares/AuthenticateJWT"); // JWT auth middleware
const router = express.Router();

// Create a new grid
router.post("/", authenticateJWT, async (req, res) => {
  const { gameId, rows, columns, cellSize } = req.body;

  try {
    const newGrid = new Grid({
      gameId,
      rows,
      columns,
      cellSize,
    });

    await newGrid.save();
    res.status(201).json({ grid: newGrid });
  } catch (err) {
    console.error("Error adding grid:", err);
    res.status(500).json({ message: "Failed to add grid" });
  }
});

// Get all grids (optional, if you need this endpoint)
router.get("/", authenticateJWT, async (req, res) => {
  try {
    const grids = await Grid.find();
    res.json(grids);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch grids" });
  }
});

module.exports = router;
