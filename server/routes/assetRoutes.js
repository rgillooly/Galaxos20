const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs").promises;
const mongoose = require("mongoose");
const Asset = require("../models/Asset");
const AssetMenu = require("../models/AssetMenu");
const authenticateJWT = require("../middlewares/AuthenticateJWT");
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique file name
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|gif/;
    const extName = fileTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimeType = fileTypes.test(file.mimetype);

    if (extName && mimeType) {
      cb(null, true);
    } else {
      cb(new Error("Only images are allowed"));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
});

router.get("/", async (req, res) => {
  const { gameId } = req.query;

  if (!gameId || !mongoose.Types.ObjectId.isValid(gameId)) {
    return res.status(400).json({ message: "Valid gameId is required" });
  }

  try {
    // Query the database for assets associated with the provided gameId
    const assets = await Asset.find({ gameId });

    if (!assets.length) {
      return res.status(404).json({ message: "No assets found for this game" });
    }

    res.status(200).json({ success: true, assets });
  } catch (error) {
    console.error("Error fetching assets:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// API to handle file uploads
router.post("/upload", upload.single("image"), async (req, res) => {
  try {
    const imagePath = `/uploads/${req.file.filename}`; // Relative path to the uploaded file

    // Save imagePath to the Asset collection in the database
    const newAsset = new Asset({
      name: req.body.name || "Unnamed Asset",
      imageUrl: imagePath,
      createdAt: new Date(),
    });

    await newAsset.save();

    res.status(201).json({
      message: "Image uploaded and saved to the database successfully",
      asset: newAsset,
    });
  } catch (error) {
    console.error("Error saving asset:", error);
    res.status(500).json({ error: "Failed to save asset to the database" });
  }
});

router.use("/uploads", express.static("uploads")); // Serve uploaded files

module.exports = router;
