const mongoose = require("mongoose");

const assetSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["image", "text"], // Can be 'image' or 'text'
    required: true,
  },
  content: {
    type: String, // For text, this is the content of the text document
    required: true,
  },
  imageUrl: {
    type: String, // For images, this would be the URL or path to the image
    required: function () {
      return this.type === "image"; // Only required if type is image
    },
  },
});

const Asset = mongoose.model("Asset", assetSchema);

module.exports = Asset;
