const express = require("express");
const Driver = require("../models/Driver");
const Bus = require("../models/Bus");
const protect = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");

const router = express.Router();
router.use(protect);
router.use(admin);

// GET all drivers
router.get("/", async (req, res) => {
  try {
    const drivers = await Driver.find()
      .populate("assignedBus")
      .sort({ createdAt: -1 });

    res.json(drivers);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch drivers",
    });
  }
});

// ADD a new driver
router.post("/", async (req, res) => {
  try {
    const {
      driverName,
      licenseNumber,
      phoneNumber,
      experience,
      assignedBus,
      status,
    } = req.body;

    if (
      !driverName ||
      !licenseNumber ||
      !phoneNumber ||
      experience === undefined
    ) {
      return res.status(400).json({
        message:
          "Please provide all required driver details",
      });
    }

    const existingDriver = await Driver.findOne({
      licenseNumber,
    });

    if (existingDriver) {
      return res.status(400).json({
        message: "License number already exists",
      });
    }

    if (assignedBus) {
      const bus = await Bus.findById(assignedBus);

      if (!bus) {
        return res.status(404).json({
          message: "Assigned bus not found",
        });
      }
    }

    const driver = await Driver.create({
      driverName,
      licenseNumber,
      phoneNumber,
      experience,
      assignedBus: assignedBus || null,
      status: status || "active",
    });

    const populatedDriver = await Driver.findById(driver._id)
      .populate("assignedBus");

    res.status(201).json({
      message: "Driver added successfully",
      driver: populatedDriver,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to add driver",
    });
  }
});

// UPDATE a driver
router.put("/:id", async (req, res) => {
  try {
    const {
      driverName,
      licenseNumber,
      phoneNumber,
      experience,
      assignedBus,
      status,
    } = req.body;

    const existingDriver = await Driver.findOne({
      licenseNumber,
      _id: { $ne: req.params.id },
    });

    if (existingDriver) {
      return res.status(400).json({
        message: "License number already exists",
      });
    }

    if (assignedBus) {
      const bus = await Bus.findById(assignedBus);

      if (!bus) {
        return res.status(404).json({
          message: "Assigned bus not found",
        });
      }
    }

    const driver = await Driver.findByIdAndUpdate(
      req.params.id,
      {
        driverName,
        licenseNumber,
        phoneNumber,
        experience,
        assignedBus: assignedBus || null,
        status,
      },
      {
        new: true,
        runValidators: true,
      }
    ).populate("assignedBus");

    if (!driver) {
      return res.status(404).json({
        message: "Driver not found",
      });
    }

    res.json({
      message: "Driver updated successfully",
      driver,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to update driver",
    });
  }
});

// DELETE a driver
router.delete("/:id", async (req, res) => {
  try {
    const driver = await Driver.findByIdAndDelete(
      req.params.id
    );

    if (!driver) {
      return res.status(404).json({
        message: "Driver not found",
      });
    }

    res.json({
      message: "Driver deleted successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to delete driver",
    });
  }
});

module.exports = router;