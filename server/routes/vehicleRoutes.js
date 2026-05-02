const express = require("express");
const router = express.Router();

const Vehicle = require("../models/Vehicle");
const controller = require("../controllers/requestController");

// ✅ GET all vehicles → /api/vehicles
router.get("/", async (req, res) => {
  try {
    const vehicles = await Vehicle.find();
    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ UPDATE vehicle status → /api/vehicles/update-status/:id
router.post("/update-status/:id", controller.updateVehicleStatus);

module.exports = router;