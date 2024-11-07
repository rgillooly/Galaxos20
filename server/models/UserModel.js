const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Schema = mongoose.Schema;

// User Schema
const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  createdGames: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Game",
    },
  ],
});

// Hash password before saving (only if password is modified)
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();  // Skip if password is not modified

  try {
    this.password = await bcrypt.hash(this.password, 12);
    next();
  } catch (err) {
    next(err);  // Pass error to the next middleware
  }
});

// Method to check if password matches during login
UserSchema.methods.isPasswordCorrect = async function (password) {
  return bcrypt.compare(password, this.password);  // Compare the provided password with the hashed password
};

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);
