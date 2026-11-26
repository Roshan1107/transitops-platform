const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const busRoutes = require("./routes/busRoutes");
const routeRoutes = require("./routes/routeRoutes");
const driverRoutes = require("./routes/driverRoutes");
const tripRoutes = require("./routes/tripRoutes");
const protect = require("./middleware/authMiddleware");
const driverProfileRoutes = require("./routes/driverProfileRoutes");

const Bus = require("./models/Bus");
const Route = require("./models/Route");
const Driver = require("./models/Driver");
const Trip = require("./models/Trip");

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

connectDB();

const app = express();

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/buses", busRoutes);
app.use("/api/routes", routeRoutes);
app.use("/api/drivers", driverRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/driver", driverProfileRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "TransitOps backend is running",
  });
});

app.get("/api/dashboard/stats", protect,async (req, res) => {
  try {
    const totalBuses = await Bus.countDocuments();
    const activeBuses = await Bus.countDocuments({
      status: "active",
    });

    const totalRoutes = await Route.countDocuments();
    const totalDrivers = await Driver.countDocuments();
    const activeDrivers = await Driver.countDocuments({
      status: "active",
    });

    const totalTrips = await Trip.countDocuments();
    const scheduledTrips = await Trip.countDocuments({
      status: "scheduled",
    });

    res.json({
      totalBuses,
      activeBuses,
      totalRoutes,
      totalDrivers,
      activeDrivers,
      totalTrips,
      scheduledTrips,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch dashboard statistics",
    });
  }
});

// Reports statistics
app.get(
  "/api/reports/stats",
  protect,
  async (req, res) => {
    try {
      // Bus statistics
      const totalBuses = await Bus.countDocuments();

      const activeBuses = await Bus.countDocuments({
        status: "active",
      });

      const maintenanceBuses =
        await Bus.countDocuments({
          status: "maintenance",
        });

      const inactiveBuses =
        await Bus.countDocuments({
          status: "inactive",
        });

      // Route statistics
      const totalRoutes = await Route.countDocuments();

      const activeRoutes = await Route.countDocuments({
        status: "active",
      });

      const inactiveRoutes =
        await Route.countDocuments({
          status: "inactive",
        });

      // Driver statistics
      const totalDrivers =
        await Driver.countDocuments();

      const activeDrivers =
        await Driver.countDocuments({
          status: "active",
        });

      const inactiveDrivers =
        await Driver.countDocuments({
          status: "inactive",
        });

      const driversOnLeave =
        await Driver.countDocuments({
          status: "on_leave",
        });

      // Trip statistics
      const totalTrips = await Trip.countDocuments();

      const scheduledTrips =
        await Trip.countDocuments({
          status: "scheduled",
        });

      const ongoingTrips =
        await Trip.countDocuments({
          status: "ongoing",
        });

      const completedTrips =
        await Trip.countDocuments({
          status: "completed",
        });

      const cancelledTrips =
        await Trip.countDocuments({
          status: "cancelled",
        });

      res.json({
        buses: {
          total: totalBuses,
          active: activeBuses,
          maintenance: maintenanceBuses,
          inactive: inactiveBuses,
        },

        routes: {
          total: totalRoutes,
          active: activeRoutes,
          inactive: inactiveRoutes,
        },

        drivers: {
          total: totalDrivers,
          active: activeDrivers,
          inactive: inactiveDrivers,
          onLeave: driversOnLeave,
        },

        trips: {
          total: totalTrips,
          scheduled: scheduledTrips,
          ongoing: ongoingTrips,
          completed: completedTrips,
          cancelled: cancelledTrips,
        },
      });
    } catch (error) {
      console.error(
        "Reports error:",
        error
      );

      res.status(500).json({
        message: "Failed to fetch report statistics",
      });
    }
  }
);

app.listen(PORT, () => {
  console.log(`TransitOps server running on http://localhost:${PORT}`);
});