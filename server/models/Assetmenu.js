// models/AssetMenu.js
const mongoose = require("mongoose");

const assetMenuSchema = new mongoose.Schema(
  {
    gameId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Game",
      required: true,
    },
    title: { type: String, required: true },
    position: { top: Number, left: Number },
    assets: [{ type: mongoose.Schema.Types.ObjectId, ref: "Asset" }], // Reference to Asset
  },
  { timestamps: true }
);

const AssetMenu = mongoose.model("AssetMenu", assetMenuSchema);
module.exports = AssetMenu;
