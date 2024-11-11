const mongoose = require("mongoose");

const AssetMenuSchema = new mongoose.Schema({
  gameId: { type: mongoose.Schema.Types.ObjectId, ref: "Game", required: true }, // Ensuring that gameId is always provided
  title: { 
    type: String, 
    required: true, // Make sure title is required
    default: "Untitled", // Default title if none is provided
    minlength: 3, // Optional: Add a minimum length for the title
  },
  position: { 
    type: Object, 
    required: true, // Ensure position is always provided
  },
  assets: { 
    type: Array, 
    default: [] // Default empty array if no assets are provided
  },
  order: { 
    type: Number,
    required: true, // Ensure the order is always provided
    index: true // Index to optimize sorting based on order
  },
}, { timestamps: true }); // Optionally, add timestamps for createdAt and updatedAt

module.exports = mongoose.model("AssetMenu", AssetMenuSchema);
