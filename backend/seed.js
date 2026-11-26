const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");

const User = require("./models/User");
const Bus = require("./models/Bus");
const Driver = require("./models/Driver");
const Route = require("./models/Route");
const Trip = require("./models/Trip");

dotenv.config();

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/transitops");
    console.log("Connected to MongoDB for seeding...");

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Bus.deleteMany({}),
      Driver.deleteMany({}),
      Route.deleteMany({}),
      Trip.deleteMany({}),
    ]);
    console.log("Cleared existing collections.");

    // Create Users
    const hashedAdminPassword = await bcrypt.hash("admin123", 10);
    const hashedDriverPassword = await bcrypt.hash("driver123", 10);
    const hashedUserPassword = await bcrypt.hash("user123", 10);

    const adminUser = await User.create({
      name: "System Administrator",
      email: "admin@transitops.com",
      password: hashedAdminPassword,
      role: "admin",
    });

    const driverUser1 = await User.create({
      name: "Ramesh Kumar",
      email: "driver1@transitops.com",
      password: hashedDriverPassword,
      role: "driver",
    });

    const driverUser2 = await User.create({
      name: "Suresh Sundaram",
      email: "driver2@transitops.com",
      password: hashedDriverPassword,
      role: "driver",
    });

    const driverUser3 = await User.create({
      name: "Karthik Raja",
      email: "driver3@transitops.com",
      password: hashedDriverPassword,
      role: "driver",
    });

    const passengerUser = await User.create({
      name: "Priya Sharma",
      email: "user@transitops.com",
      password: hashedUserPassword,
      role: "user",
    });

    console.log("Created default users (Admin, Drivers, Passenger).");

    // Create Buses with coordinates
    const buses = await Bus.create([
      {
        busNumber: "TN-58-AX-1001",
        registrationNumber: "REG-MAD-001",
        model: "Volvo B7R Semi-Low Floor",
        capacity: 52,
        latitude: 9.9252,
        longitude: 78.1198,
        status: "active",
      },
      {
        busNumber: "TN-58-BX-2002",
        registrationNumber: "REG-MAD-002",
        model: "Tata Starbus Electric",
        capacity: 40,
        latitude: 9.9312,
        longitude: 78.1255,
        status: "active",
      },
      {
        busNumber: "TN-58-CX-3003",
        registrationNumber: "REG-MAD-003",
        model: "Ashok Leyland JanBus",
        capacity: 48,
        latitude: 9.9189,
        longitude: 78.1090,
        status: "active",
      },
      {
        busNumber: "TN-58-DX-4004",
        registrationNumber: "REG-MAD-004",
        model: "Eicher Skyline Pro",
        capacity: 35,
        latitude: 9.9401,
        longitude: 78.1399,
        status: "maintenance",
      },
    ]);

    console.log("Created sample buses.");

    // Create Drivers
    const drivers = await Driver.create([
      {
        user: driverUser1._id,
        driverName: "Ramesh Kumar",
        licenseNumber: "DL-TN58-2018001",
        phoneNumber: "+91 9876543210",
        experience: 8,
        assignedBus: buses[0]._id,
        status: "active",
      },
      {
        user: driverUser2._id,
        driverName: "Suresh Sundaram",
        licenseNumber: "DL-TN58-2019002",
        phoneNumber: "+91 9843210987",
        experience: 5,
        assignedBus: buses[1]._id,
        status: "active",
      },
      {
        user: driverUser3._id,
        driverName: "Karthik Raja",
        licenseNumber: "DL-TN58-2020003",
        phoneNumber: "+91 9765432109",
        experience: 6,
        assignedBus: buses[2]._id,
        status: "active",
      },
    ]);

    console.log("Created driver profiles.");

    // Create Routes
    const routes = await Route.create([
      {
        routeNumber: "R-101",
        routeName: "Mattuthavani Express",
        startPoint: "Mattuthavani Bus Stand",
        endPoint: "Periyar Bus Stand",
        stops: [
          "Mattuthavani Integrated Bus Terminus",
          "KK Nagar Circle",
          "Goripalayam Junction",
          "Simmakkal",
          "Periyar Bus Stand",
        ],
        status: "active",
      },
      {
        routeNumber: "R-102",
        routeName: "Anna Nagar City Loop",
        startPoint: "Anna Nagar",
        endPoint: "Railway Station",
        stops: [
          "Anna Nagar Tower",
          "Ambika Theatre",
          "Collectorate",
          "Gandhi Museum",
          "Madurai Junction Station",
        ],
        status: "active",
      },
      {
        routeNumber: "R-103",
        routeName: "Airport Corridor",
        startPoint: "Periyar Bus Stand",
        endPoint: "Madurai International Airport",
        stops: [
          "Periyar Bus Stand",
          "TVS Nagar",
          "Subramaniapuram",
          "Perungudi Junction",
          "Madurai International Airport",
        ],
        status: "active",
      },
      {
        routeNumber: "R-104",
        routeName: "Thiruparankundram Heritage",
        startPoint: "Periyar Bus Stand",
        endPoint: "Thiruparankundram Temple",
        stops: [
          "Periyar Bus Stand",
          "Palananganallur",
          "Pykara",
          "Thiruparankundram Junction",
          "Temple Gate",
        ],
        status: "active",
      },
    ]);

    console.log("Created transit routes.");

    // Create Trips
    const today = new Date();
    await Trip.create([
      {
        bus: buses[0]._id,
        route: routes[0]._id,
        driver: drivers[0]._id,
        tripDate: today,
        startTime: "08:30",
        endTime: "09:45",
        status: "ongoing",
      },
      {
        bus: buses[1]._id,
        route: routes[1]._id,
        driver: drivers[1]._id,
        tripDate: today,
        startTime: "09:00",
        endTime: "10:15",
        status: "ongoing",
      },
      {
        bus: buses[2]._id,
        route: routes[2]._id,
        driver: drivers[2]._id,
        tripDate: today,
        startTime: "11:00",
        endTime: "12:30",
        status: "scheduled",
      },
      {
        bus: buses[0]._id,
        route: routes[3]._id,
        driver: drivers[0]._id,
        tripDate: today,
        startTime: "06:00",
        endTime: "07:15",
        status: "completed",
      },
    ]);

    console.log("Created trips (ongoing, scheduled, completed).");

    console.log("\n==========================================");
    console.log("DATABASE SEEDED SUCCESSFULLY!");
    console.log("------------------------------------------");
    console.log("Admin Login:    admin@transitops.com / admin123");
    console.log("Driver 1 Login: driver1@transitops.com / driver123");
    console.log("Driver 2 Login: driver2@transitops.com / driver123");
    console.log("Passenger:      user@transitops.com / user123");
    console.log("==========================================\n");

    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
};

seedDatabase();
