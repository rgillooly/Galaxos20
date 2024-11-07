const mongoose = require("mongoose");

mongoose.connect(
  process.env.MONGO_URL || "mongodb://127.0.0.1:27017/Galaxos20"
);

module.exports = mongoose.connection;
