const mongoose = require("mongoose");

const gameSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Assuming user is a reference to the User model
  assetMenus: [{ type: mongoose.Schema.Types.ObjectId, ref: "AssetMenu" }], // Assuming assetMenus are references to an AssetMenu model
});

const Game = mongoose.model("Game", gameSchema);

module.exports = Game; // Correct export of the Game model
