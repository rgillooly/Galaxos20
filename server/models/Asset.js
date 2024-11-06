// models/Asset.js
const mongoose = require("mongoose");

const assetSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    url: { type: String, required: false }, // URL is optional
  },
  { timestamps: true }
);

const Asset = mongoose.model("Asset", assetSchema);
module.exports = Asset;
