const express = require("express");
const Driver = require("../models/Driver");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Driver profile
router.get("/profile", protect, async (req, res) => {
  try {
    if (req.user.role !== "driver") {
      return res.status(403).json({
        message: "Access denied. Driver only.",
      });
    }

    const driver = await Driver.findOne({
      user: req.user.userId,
    }).populate("assignedBus");

    if (!driver) {
      return res.status(404).json({
        message: "Driver profile not found",
      });
    }

    res.json(driver);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch driver profile",
    });
  }
});
// Driver trips
router.get("/trips", protect, async (req, res) => {
  try {
    if (req.user.role !== "driver") {
      return res.status(403).json({
        message: "Access denied. Driver only.",
      });
    }

    const driver = await Driver.findOne({
      user: req.user.userId,
    });

    if (!driver) {
      return res.status(404).json({
        message: "Driver profile not found",
      });
    }

    const Trip = require("../models/Trip");

    const trips = await Trip.find({
      driver: driver._id,
    })
      .populate("bus")
      .populate("route")
      .sort({ tripDate: -1 });

    res.json(trips);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch driver trips",
    });
  }
});
// Update driver trip status
router.put("/trips/:id/status", protect, async (req, res) => {
  try {
    if (req.user.role !== "driver") {
      return res.status(403).json({
        message: "Access denied. Driver only.",
      });
    }

    const { status } = req.body;

    const allowedStatuses = [
      "scheduled",
      "ongoing",
      "completed",
      "cancelled",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid trip status",
      });
    }

    const driver = await Driver.findOne({
      user: req.user.userId,
    });

    if (!driver) {
      return res.status(404).json({
        message: "Driver profile not found",
      });
    }

    const Trip = require("../models/Trip");

    const trip = await Trip.findOneAndUpdate(
      {
        _id: req.params.id,
        driver: driver._id,
      },
      {
        status,
      },
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("bus")
      .populate("route");

    if (!trip) {
      return res.status(404).json({
        message: "Trip not found or not assigned to you",
      });
    }

    res.json({
      message: "Trip status updated successfully",
      trip,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to update trip status",
    });
  }
});

// Get driver's ongoing trips
router.get("/active-trips", protect, async (req, res) => {
  try {
    if (req.user.role !== "driver") {
      return res.status(403).json({
        message: "Access denied. Driver only.",
      });
    }

    const driver = await Driver.findOne({
      user: req.user.userId,
    });

    if (!driver) {
      return res.status(404).json({
        message: "Driver profile not found",
      });
    }

    const Trip = require("../models/Trip");

    const trips = await Trip.find({
      driver: driver._id,
      status: "ongoing",
    })
      .populate("bus")
      .populate("route");

    res.json(trips);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch active trips",
    });
  }
});

// Update driver's assigned bus live location
router.put("/location", protect, async (req, res) => {
  try {
    if (req.user.role !== "driver") {
      return res.status(403).json({
        message: "Access denied. Driver only.",
      });
    }

    const { latitude, longitude } = req.body;

    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        message: "Latitude and longitude are required",
      });
    }

    const driver = await Driver.findOne({
      user: req.user.userId,
    }).populate("assignedBus");

    if (!driver || !driver.assignedBus) {
      return res.status(404).json({
        message: "No assigned bus found for driver",
      });
    }

    const Bus = require("../models/Bus");
    const updatedBus = await Bus.findByIdAndUpdate(
      driver.assignedBus._id,
      { latitude, longitude },
      { new: true, runValidators: true }
    );

    res.json({
      message: "Location updated successfully",
      bus: updatedBus,
    });
  } catch (error) {
    console.error("Error updating driver bus location:", error);
    res.status(500).json({
      message: "Failed to update bus location",
    });
  }
});

module.exports = router;