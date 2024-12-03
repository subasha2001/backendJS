const express = require("express");
const asyncHandler = require("express-async-handler");
const { DC, rates } = require("../dataType");
const { GoldSilverModel } = require("../models/goldSilverModel");
const { DeliveryChargeModel } = require("../models/productsModel");

const router = express.Router();

// Seed gold and silver rate data
router.get(
  "/seed",
  asyncHandler(async (req, res) => {
    const gsgst = await GoldSilverModel.countDocuments();
    if (gsgst > 0) {
      return res.send("Seed is already done, banner!");
    }

    await GoldSilverModel.create(rates);
    res.send("Seed is Done!");
  })
);

// Seed delivery charge data
router.get(
  "/DCU/seed",
  asyncHandler(async (req, res) => {
    const DCU = await DeliveryChargeModel.countDocuments();
    if (DCU > 0) {
      return res.send("Seed is already done, banner!");
    }

    await DeliveryChargeModel.create(DC);
    res.send("Seed is Done!");
  })
);

// Post gold and silver rates
router.post(
  "/goldSilverRate",
  asyncHandler(async (req, res) => {
    const { gold22, gold24, gold18, silver, gst } = req.body;

    // Remove existing entries before adding the new one
    await GoldSilverModel.deleteMany({});
    const existingRate = await GoldSilverModel.findOne({ gold22 });

    if (existingRate) {
      return res.status(404).send("Rate already present");
    }

    const newRate = {
      gold22,
      gold24,
      gold18,
      silver,
      gst: gst / 100, // Convert GST to a decimal
    };

    const dbRate = await GoldSilverModel.create(newRate);
    res.send(dbRate);
  })
);

// Get all gold and silver rates
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const gsgst = await GoldSilverModel.find();
    res.send(gsgst);
  })
);

// Add/update delivery charge based on pincode
router.post("/delivery-charge", async (req, res) => {
  try {
    const { pincode, charge } = req.body;

    if (!pincode || charge === undefined) {
      return res.status(400).json({ error: "Pincode and charge are required" });
    }

    const updatedCharge = await DeliveryChargeModel.findOneAndUpdate(
      { pincode },
      { charge },
      { new: true, upsert: true } // Upsert creates if not found
    );

    res.json({
      message: "Delivery charge updated successfully",
      data: updatedCharge,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server error" });
  }
});

// Get delivery charge by pincode
router.get("/delivery-charge/:pincode", async (req, res) => {
  const { pincode } = req.params;
  try {
    const charge = await DeliveryChargeModel.findOne({ pincode: pincode });
    if (!charge) {
      return res
        .status(404)
        .json({ message: "Delivery charge not found for this pincode" });
    }
    res.json(charge);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Update delivery charge based on pincode
router.put("/delivery-charge/:pincode", async (req, res) => {
  try {
    const { pincode } = req.params;
    const { charge } = req.body;

    if (!charge && charge !== 0) {
      return res.status(400).json({ error: "Charge is required" });
    }

    const updatedCharge = await DeliveryChargeModel.findOneAndUpdate(
      { pincode },
      { charge },
      { new: true } // Return the updated document
    );

    if (!updatedCharge) {
      return res.status(404).json({ error: "Pincode not found" });
    }

    res.json({
      message: "Delivery charge updated successfully",
      data: updatedCharge,
    });
  } catch (error) {
    res.status(500).json({ error: "Server error", details: error.message });
  }
});

module.exports = router;
