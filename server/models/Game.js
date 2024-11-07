const mongoose = require("mongoose");

const gameSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  gameName: { type: String, required: true },
  gameDescription: { type: String, required: true },
  assetMenus: { type: Array, default: [] },
});

module.exports = mongoose.model("Game", gameSchema);
