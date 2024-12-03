const mongoose = require("mongoose");

const gridSchema = new mongoose.Schema({
  gameId: { type: mongoose.Schema.Types.ObjectId, ref: "Game", required: true },
  rows: { type: Number, required: true },
  columns: { type: Number, required: true },
  cellSize: { type: Number, default: 100 },
  assets: [{ type: mongoose.Schema.Types.ObjectId, ref: "Asset" }],
});

const Grid = mongoose.model("Grid", gridSchema);

module.exports = Grid;
