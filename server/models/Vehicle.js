const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema({
  type: String,
  location: {
    lat: Number,
    lng: Number,
  },
  status: {
    type: String,
    enum: ["available", "busy"],
    default: "available",
  },
});

module.exports = mongoose.model("Vehicle", vehicleSchema);