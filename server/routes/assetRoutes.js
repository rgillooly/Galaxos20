const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs").promises;
const Asset = require("../models/Asset");
const AssetMenu = require("../models/AssetMenu"); // Import AssetMenu
const authenticateJWT = require("../middlewares/AuthenticateJWT");
const router = express.Router();

// Multer setup for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "..", "uploads", "assets");
    fs.mkdir(uploadDir, { recursive: true })
      .then(() => cb(null, uploadDir))
      .catch((err) => cb(err, null));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
  },
});

const upload = multer({ storage });

// Asset upload route
router.post(
  "/upload",
  authenticateJWT,
  upload.single("file"),
  async (req, res) => {
    try {
      const { assetMenuId } = req.body;

      // Validate assetMenuId and file
      if (!assetMenuId) {
        return res.status(400).json({ message: "AssetMenu ID is required" });
      }
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Validate file type and size
      const allowedTypes = ["image/jpeg", "image/png", "application/pdf"]; // Add your allowed types
      if (!allowedTypes.includes(req.file.mimetype)) {
        return res.status(400).json({ message: "Invalid file type" });
      }

      const maxSize = 10 * 1024 * 1024; // 10MB max file size
      if (req.file.size > maxSize) {
        return res
          .status(400)
          .json({ message: "File size exceeds the limit of 10MB" });
      }

      // Find AssetMenu by ID
      const assetMenu = await AssetMenu.findById(assetMenuId);
      if (!assetMenu) {
        return res
          .status(404)
          .json({ message: "AssetMenu not found with the provided ID" });
      }

      // Create new asset and link it to the AssetMenu
      const newAsset = new Asset({
        name: req.file.originalname,
        type: req.file.mimetype,
        size: req.file.size,
        filePath: `uploads/assets/${req.file.filename}`,
        assetMenu: assetMenuId, // Associate the asset with the asset menu
      });

      await newAsset.save();

      // Add the asset to the AssetMenu's asset list
      assetMenu.assets.push(newAsset);
      await assetMenu.save();

      res.json({ message: "Asset uploaded successfully", asset: newAsset });
    } catch (error) {
      console.error("Error uploading asset:", error);
      res
        .status(500)
        .json({ message: "Error uploading asset", error: error.message });
    }
  }
);

// Fetch assets for a specific AssetMenu
router.get("/:assetMenuId", async (req, res) => {
  try {
    const assets = await Asset.find({ assetMenu: req.params.assetMenuId });
    res.status(200).json({ success: true, assets });
  } catch (error) {
    console.error("Error fetching assets:", error);
    res.status(500).json({ success: false, message: "Failed to fetch assets" });
  }
});

module.exports = router;
