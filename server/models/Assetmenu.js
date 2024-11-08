const mongoose = require("mongoose");

const AssetMenuSchema = new mongoose.Schema({
  gameId: { type: mongoose.Schema.Types.ObjectId, ref: "Game" },
  title: String,
  position: Object,
  assets: Array,
});

module.exports = mongoose.model("AssetMenu", AssetMenuSchema);
