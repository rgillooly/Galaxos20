// models/index.js
const User = require("./UserModel");
const Game = require("./Game");
const AssetMenu = require("./Assetmenu");
const Asset = require("./Asset");

module.exports = { User, Game, AssetMenu, Asset }; // Export each model directly
