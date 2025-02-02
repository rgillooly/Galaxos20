const mongoose = require("mongoose");

const GameSchema = new mongoose.Schema({
  gameName: {
    type: String,
    required: true, // Optional: Ensure the game has a name
  },
  gameDescription: {
    type: String,
    required: false, // Optional: A description isn't mandatory
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true, // Optional: Ensure a user is associated with the game
  },
  assetMenus: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AssetMenu", // Reference the `AssetMenu` model
    },
  ],
  grids: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Grid", // Reference the `Grid` model
    },
  ],
});

module.exports = mongoose.model("Game", GameSchema);
