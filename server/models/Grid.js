const mongoose = require("mongoose");

const PositionSchema = new mongoose.Schema({
  top: {
    type: Number,
    required: true, // Ensuring that the top position is always provided
  },
  left: {
    type: Number,
    required: true, // Ensuring that the left position is always provided
  },
});

const GridSchema = new mongoose.Schema({
  gameId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Game", // Assuming Game is another model
  },
  rows: {
    type: Number,
    required: true,
  },
  columns: {
    type: Number,
    required: true,
  },
  cellSize: {
    type: Number,
    required: true,
  },
  position: {
    type: PositionSchema,
    required: true, // Ensure position is always provided
  },
  assets: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Asset", // Refers to another collection called 'Asset'
    },
  ],
});

const Grid = mongoose.model("Grid", GridSchema);

module.exports = Grid;
