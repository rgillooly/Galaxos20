// models/Asset.js
const mongoose = require("mongoose");

const assetSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: { type: String, required: true },
    size: { type: Number, required: true }, // Make sure size is in bytes or a consistent unit
    filePath: { type: String, required: true },
    assetMenu: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AssetMenu",
      required: true,
    }, // Reference to the AssetMenu
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt fields
);

// Optionally add indexes if needed
assetSchema.index({ name: 1 });
assetSchema.index({ assetMenu: 1 });

module.exports = mongoose.model("Asset", assetSchema);
