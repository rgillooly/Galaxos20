const mongoose = require("mongoose");
const Game = require("./Game");

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

const AssetMenuSchema = new mongoose.Schema(
  {
    id: {
      type: String, // Change this from ObjectId to String
    },
    gameId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Game",
      required: true, // Ensuring that gameId is always provided
    },
    title: {
      type: String,
      required: true, // Make sure title is required
      default: "Untitled", // Default title if none is provided
      minlength: 3, // Optional: Add a minimum length for the title
    },
    position: {
      type: PositionSchema,
      required: true, // Ensure position is always provided
    },
    assets: [{ type: mongoose.Schema.Types.ObjectId, ref: "Asset" }],
  },
  { timestamps: true } // Optionally, add timestamps for createdAt and updatedAt
);

const AssetMenu = mongoose.model("AssetMenu", AssetMenuSchema);

module.exports = AssetMenu;
