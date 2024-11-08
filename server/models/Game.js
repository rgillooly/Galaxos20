const mongoose = require("mongoose");

const GameSchema = new mongoose.Schema({
  gameName: String,
  gameDescription: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  assetMenus: [{ type: mongoose.Schema.Types.ObjectId, ref: "AssetMenu" }],
});

module.exports = mongoose.model("Game", GameSchema);
