const express = require("express");
const Bus = require("../models/Bus");
const protect = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");

const router = express.Router();
router.use(protect);

// Get all buses
router.get("/", async (req, res) => {
  try {
    const buses = await Bus.find().sort({ createdAt: -1 });

    res.json(buses);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch buses",
    });
  }
});
// Update bus live location
router.put("/:id/location", async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    if (
      latitude === undefined ||
      longitude === undefined
    ) {
      return res.status(400).json({
        message: "Latitude and longitude are required",
      });
    }

    const bus = await Bus.findByIdAndUpdate(
      req.params.id,
      {
        latitude,
        longitude,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!bus) {
      return res.status(404).json({
        message: "Bus not found",
      });
    }

    res.json({
      message: "Bus location updated successfully",
      bus,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to update bus location",
    });
  }
});

router.use(admin);
// Add a new bus
router.post("/", async (req, res) => {
  try {
    const {
      busNumber,
      registrationNumber,
      model,
      capacity,
      latitude,
      longitude,
      status,
    } = req.body;

    if (
      !busNumber ||
      !registrationNumber ||
      !model ||
      !capacity
    ) {
      return res.status(400).json({
        message: "Please provide all required bus details",
      });
    }

    const existingBus = await Bus.findOne({
      $or: [
        { busNumber },
        { registrationNumber },
      ],
    });

    if (existingBus) {
      return res.status(400).json({
        message: "Bus number or registration number already exists",
      });
    }

    const bus = await Bus.create({
      busNumber,
      registrationNumber,
      model,
      capacity,
      latitude,
      longitude,
      status: status || "active",
    });

    res.status(201).json({
      message: "Bus added successfully",
      bus,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to add bus",
    });
  }
});
// Update a bus
router.put("/:id", async (req, res) => {
  try {
    const {
      busNumber,
      registrationNumber,
      model,
      capacity,
      latitude,
      longitude,
      status,
    } = req.body;

    const bus = await Bus.findByIdAndUpdate(
      req.params.id,
      {
        busNumber,
        registrationNumber,
        model,
        capacity,
        latitude,
        longitude,
        status,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!bus) {
      return res.status(404).json({
        message: "Bus not found",
      });
    }

    res.json({
      message: "Bus updated successfully",
      bus,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to update bus",
    });
  }
});
// Delete a bus
router.delete("/:id", async (req, res) => {
  try {
    const bus = await Bus.findByIdAndDelete(req.params.id);

    if (!bus) {
      return res.status(404).json({
        message: "Bus not found",
      });
    }

    res.json({
      message: "Bus deleted successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to delete bus",
    });
  }
});
module.exports = router;