// models/Asset.js
const mongoose = require("mongoose");

const assetSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  size: { type: Number, required: true },
  filePath: { type: String, required: true },
  assetMenu: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AssetMenu",
    required: true,
  }, // Reference to the AssetMenu
});

module.exports = mongoose.model("Asset", assetSchema);
