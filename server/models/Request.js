const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },

  emergencyType: {
    type: String,
    required: true,
  },

  location: {
    lat: Number,
    lng: Number,
  },

  assignedVehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vehicle",
  },

  status: {
    type: String,
    enum: [
      "assigned",
      "on_the_way",
      "reached",
      "completed",
      "cancelled"   // ✅ ADD THIS
    ],
    default: "assigned",
  },
  route: [
    {
      lat: Number,
      lng: Number,
    },
  ],

}, { timestamps: true });

module.exports = mongoose.model("Request", requestSchema);