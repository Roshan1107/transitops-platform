const mongoose = require("mongoose");

const routeSchema = new mongoose.Schema(
  {
    routeNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    routeName: {
      type: String,
      required: true,
      trim: true,
    },

    startPoint: {
      type: String,
      required: true,
      trim: true,
    },

    endPoint: {
      type: String,
      required: true,
      trim: true,
    },

    stops: [
      {
        type: String,
        trim: true,
      },
    ],

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Route", routeSchema);