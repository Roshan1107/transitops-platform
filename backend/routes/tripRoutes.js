const express = require("express");
const Trip = require("../models/Trip");
const Bus = require("../models/Bus");
const Route = require("../models/Route");
const Driver = require("../models/Driver");
const protect = require("../middleware/authMiddleware");

const router = express.Router();
router.use(protect);

// Get currently ongoing trips
router.get("/active", async (req, res) => {
  try {
    const trips = await Trip.find({
      status: "ongoing",
    })
      .populate("bus")
      .populate("route")
      .populate("driver");

    res.json(trips);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch active trips",
    });
  }
});
// Helper to parse dates in multiple formats (YYYY-MM-DD, DD-MM-YYYY, DD/MM/YYYY, etc.)
const parseDate = (input) => {
  if (!input) return null;
  if (input instanceof Date && !isNaN(input.getTime())) return input;
  const str = String(input).trim();
  
  // YYYY-MM-DD or YYYY/MM/DD
  const ymd = str.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
  if (ymd) {
    const year = parseInt(ymd[1], 10);
    const month = parseInt(ymd[2], 10) - 1;
    const day = parseInt(ymd[3], 10);
    const d = new Date(year, month, day);
    if (!isNaN(d.getTime())) return d;
  }

  // DD-MM-YYYY or DD/MM/YYYY
  const dmy = str.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  if (dmy) {
    const day = parseInt(dmy[1], 10);
    const month = parseInt(dmy[2], 10) - 1;
    const year = parseInt(dmy[3], 10);
    const d = new Date(year, month, day);
    if (!isNaN(d.getTime())) return d;
  }

  const d = new Date(str);
  return !isNaN(d.getTime()) ? d : null;
};

// GET all trips (supports optional date query: ?date=YYYY-MM-DD)
router.get("/", async (req, res) => {
  try {
    const filter = {};
    if (req.query.date) {
      const parsed = parseDate(req.query.date);
      if (parsed) {
        const startOfDay = new Date(parsed);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(parsed);
        endOfDay.setHours(23, 59, 59, 999);
        filter.tripDate = { $gte: startOfDay, $lte: endOfDay };
      }
    }
    if (req.query.status && req.query.status !== "all") {
      filter.status = req.query.status;
    }

    const trips = await Trip.find(filter)
      .populate("bus")
      .populate("route")
      .populate("driver")
      .sort({ tripDate: -1 });

    res.json(trips);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch trips",
    });
  }
});

// ADD a new trip
router.post("/", async (req, res) => {
  try {
    const {
      bus,
      route,
      driver,
      tripDate,
      startTime,
      endTime,
      status,
    } = req.body;

    if (
      !bus ||
      !route ||
      !driver ||
      !tripDate ||
      !startTime ||
      !endTime
    ) {
      return res.status(400).json({
        message: "Please provide all required trip details",
      });
    }

    const parsedTripDate = parseDate(tripDate);
    if (!parsedTripDate) {
      return res.status(400).json({
        message: "Invalid trip date format. Please use YYYY-MM-DD or DD/MM/YYYY",
      });
    }

    const busExists = await Bus.findById(bus);

    if (!busExists) {
      return res.status(404).json({
        message: "Bus not found",
      });
    }

    const routeExists = await Route.findById(route);

    if (!routeExists) {
      return res.status(404).json({
        message: "Route not found",
      });
    }

    const driverExists = await Driver.findById(driver);

    if (!driverExists) {
      return res.status(404).json({
        message: "Driver not found",
      });
    }

    const existingTrip = await Trip.findOne({
      bus,
      route,
      driver,
      tripDate: parsedTripDate,
      startTime,
      endTime,
    });

    if (existingTrip) {
      return res.status(400).json({
        message: "This trip already exists",
      });
    }

    const trip = await Trip.create({
      bus,
      route,
      driver,
      tripDate: parsedTripDate,
      startTime,
      endTime,
      status: status || "scheduled",
    });

    const populatedTrip = await Trip.findById(trip._id)
      .populate("bus")
      .populate("route")
      .populate("driver");

    res.status(201).json({
      message: "Trip added successfully",
      trip: populatedTrip,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to add trip",
    });
  }
});

// UPDATE a trip
router.put("/:id", async (req, res) => {
  try {
    const {
      bus,
      route,
      driver,
      tripDate,
      startTime,
      endTime,
      status,
    } = req.body;

    const updatePayload = {
      bus,
      route,
      driver,
      startTime,
      endTime,
      status,
    };

    if (tripDate) {
      const parsedTripDate = parseDate(tripDate);
      if (!parsedTripDate) {
        return res.status(400).json({
          message: "Invalid trip date format. Please use YYYY-MM-DD or DD/MM/YYYY",
        });
      }
      updatePayload.tripDate = parsedTripDate;
    }

    const trip = await Trip.findByIdAndUpdate(
      req.params.id,
      updatePayload,
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("bus")
      .populate("route")
      .populate("driver");

    if (!trip) {
      return res.status(404).json({
        message: "Trip not found",
      });
    }

    res.json({
      message: "Trip updated successfully",
      trip,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to update trip",
    });
  }
});

// DELETE a trip
router.delete("/:id", async (req, res) => {
  try {
    const trip = await Trip.findByIdAndDelete(req.params.id);

    if (!trip) {
      return res.status(404).json({
        message: "Trip not found",
      });
    }

    res.json({
      message: "Trip deleted successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to delete trip",
    });
  }
});

module.exports = router;