const mongoose = require("mongoose");

const GameSchema = new mongoose.Schema({
  name: String,
  description: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  assetMenus: [{ type: mongoose.Schema.Types.ObjectId, ref: "AssetMenu" }],
});

const Game = mongoose.model("Game", GameSchema); // Make sure this is correct

module.exports = Game;
