const express = require("express");
const Route = require("../models/Route");
const protect = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");

const router = express.Router();
router.use(protect);

// GET all routes (Accessible to all logged-in users)
router.get("/", async (req, res) => {
  try {
    const routes = await Route.find().sort({ createdAt: -1 });

    res.json(routes);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch routes",
    });
  }
});

// Admin authorization required for management routes
router.use(admin);

// ADD a new route
router.post("/", async (req, res) => {
  try {
    const {
      routeNumber,
      routeName,
      startPoint,
      endPoint,
      stops,
      status,
    } = req.body;

    if (
      !routeNumber ||
      !routeName ||
      !startPoint ||
      !endPoint
    ) {
      return res.status(400).json({
        message:
          "Please provide route number, route name, start point and end point",
      });
    }

    const existingRoute = await Route.findOne({
      routeNumber,
    });

    if (existingRoute) {
      return res.status(400).json({
        message: "Route number already exists",
      });
    }

    const route = await Route.create({
      routeNumber,
      routeName,
      startPoint,
      endPoint,
      stops: stops || [],
      status: status || "active",
    });

    res.status(201).json({
      message: "Route added successfully",
      route,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to add route",
    });
  }
});

// UPDATE a route
router.put("/:id", async (req, res) => {
  try {
    const {
      routeNumber,
      routeName,
      startPoint,
      endPoint,
      stops,
      status,
    } = req.body;

    const route = await Route.findByIdAndUpdate(
      req.params.id,
      {
        routeNumber,
        routeName,
        startPoint,
        endPoint,
        stops,
        status,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!route) {
      return res.status(404).json({
        message: "Route not found",
      });
    }

    res.json({
      message: "Route updated successfully",
      route,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to update route",
    });
  }
});

// DELETE a route
router.delete("/:id", async (req, res) => {
  try {
    const route = await Route.findByIdAndDelete(req.params.id);
    if (!route) {
      return res.status(404).json({
        message: "Route not found",
      });
    }
    res.json({
      message: "Route deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to delete route",
    });
  }
});

module.exports = router;