const express = require("express");
const router = express.Router();
const AssetMenu = require("../models/AssetMenu");
const authenticateJWT = require("../middlewares/AuthenticateJWT");
const mongoose = require("mongoose");

// Route to create a new asset menu for a specific game
router.post("/", async (req, res) => {
  try {
    const { title = "", position, assets, gameId, order } = req.body;

    if (!gameId) {
      return res.status(400).json({
        success: false,
        message: "gameId is required",
      });
    }

    // Default to "Untitled" if title is blank
    const newAssetMenu = new AssetMenu({
      title: title.trim() || "Untitled", // Default title if empty or whitespace
      position,
      assets,
      gameId,
      order,
    });

    await newAssetMenu.save();

    res.status(201).json({
      success: true,
      message: "Asset Menu created successfully",
      assetMenu: newAssetMenu,
    });
  } catch (error) {
    console.error("Error creating asset menu:", error); // Log the error for debugging
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

// Backend database fetch for asset menus (in the relevant route)
router.get("/", async (req, res) => {
  const { gameId } = req.query;
  try {
    const assetMenus = await AssetMenu.find({ gameId }).sort("order");

    // If some menus don't have an order, assign them one based on their index
    const assetMenusWithDefaultOrder = assetMenus.map((menu, index) => ({
      ...menu.toObject(),
      order: menu.order || index, // Assign default order if not present
    }));

    res.json(assetMenusWithDefaultOrder);
  } catch (error) {
    console.error("Error fetching asset menus:", error);
    res.status(500).json({ message: "Error fetching asset menus", error });
  }
});

// Route to update order of asset menus in bulk
router.put("/assetMenus/update-order", authenticateJWT, async (req, res) => {
  const { orderedData } = req.body;

  console.log(
    "Ordered Data Received from Client:",
    JSON.stringify(orderedData, null, 2)
  );

  if (!Array.isArray(orderedData)) {
    return res.status(400).json({
      success: false,
      message: "orderedData should be an array",
    });
  }

  const invalidItems = orderedData.filter(
    (item) =>
      !mongoose.Types.ObjectId.isValid(item._id) ||
      typeof item.order !== "number"
  );

  if (invalidItems.length > 0) {
    console.log("Invalid Items in Ordered Data:", invalidItems);
    return res.status(400).json({
      success: false,
      message: "Each item must have a valid '_id' and 'order'",
      invalidItems,
    });
  }

  try {
    const bulkOps = orderedData.map(({ _id, order }) => ({
      updateOne: {
        filter: { _id: new mongoose.Types.ObjectId(_id) }, // Use 'new' for ObjectId
        update: { $set: { order } },
      },
    }));

    console.log("Bulk Operations Prepared for DB:", bulkOps);

    const result = await AssetMenu.bulkWrite(bulkOps);

    console.log("Bulk Write Result:", result);

    if (result.modifiedCount === 0) {
      return res.status(400).json({
        success: false,
        message: "No orders were updated",
      });
    }

    res.status(200).json({
      success: true,
      message: "Asset menu orders updated successfully",
    });
  } catch (error) {
    console.error("Error updating asset menu order:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update order",
      error,
    });
  }
});

// Route to update individual asset menu order
router.put(
  "/assetMenus/order/bulk-update",
  authenticateJWT,
  async (req, res) => {
    console.log("Bulk Order Update Route triggered");
    const { orderedData } = req.body;

    if (!Array.isArray(orderedData)) {
      return res.status(400).json({
        success: false,
        message: "orderedData should be an array",
      });
    }

    const invalidItems = orderedData.filter(
      (item) =>
        !mongoose.Types.ObjectId.isValid(item._id) ||
        typeof item.order !== "number"
    );

    if (invalidItems.length > 0) {
      console.log("Invalid Items in Ordered Data:", invalidItems);
      return res.status(400).json({
        success: false,
        message: "Each item must have a valid '_id' and 'order'",
        invalidItems,
      });
    }

    try {
      const bulkOps = orderedData.map(({ _id, order }) => ({
        updateOne: {
          filter: { _id: mongoose.Types.ObjectId(_id) },
          update: { $set: { order } },
        },
      }));

      console.log("Bulk Operations Prepared for DB:", bulkOps);

      const result = await AssetMenu.bulkWrite(bulkOps);

      console.log("Bulk Write Result:", result);

      if (result.modifiedCount === 0) {
        return res.status(400).json({
          success: false,
          message: "No orders were updated",
        });
      }

      res.status(200).json({
        success: true,
        message: "Asset menu orders updated successfully",
      });
    } catch (error) {
      console.error("Error updating asset menu order:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update order",
        error,
      });
    }
  }
);

// Title update route should be placed after to avoid route conflicts
router.put("/title-update/:id", async (req, res) => {
  const { id } = req.params; // Extract the ID from the URL params
  const { title } = req.body; // Get the new title from the request body

  console.log("Updating title for ID:", id); // Log the incoming request for debugging

  // Validate ObjectId format
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid ID format" });
  }

  // Validate the title (make sure it's not empty)
  if (!title || title.trim() === "") {
    return res.status(400).json({ message: "Title cannot be empty" });
  }

  try {
    const assetMenu = await AssetMenu.findById(id);
    if (!assetMenu) {
      return res.status(404).json({ message: "AssetMenu not found" });
    }

    // Update only the title field with the received title
    assetMenu.title = title.trim(); // Ensure the title is trimmed of spaces
    await assetMenu.save();

    console.log("Updated AssetMenu:", assetMenu); // Log the updated asset menu

    res.status(200).json({
      success: true,
      message: "Asset menu title updated successfully",
      assetMenu,
    });
  } catch (error) {
    console.error("Error updating AssetMenu:", error);
    res.status(500).json({ message: "Error updating AssetMenu", error });
  }
});

module.exports = router;
