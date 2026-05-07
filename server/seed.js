require("dotenv").config();
const mongoose = require("mongoose");
const Vehicle = require("./models/Vehicle");

const vehicles = [
  { type: "ambulance", location: { lat: 17.3950, lng: 78.4900 }, status: "available" },
  { type: "ambulance", location: { lat: 17.3800, lng: 78.4750 }, status: "available" },
  { type: "ambulance", location: { lat: 17.3700, lng: 78.5000 }, status: "available" },
  { type: "police",    location: { lat: 17.3900, lng: 78.4800 }, status: "available" },
  { type: "police",    location: { lat: 17.4000, lng: 78.4950 }, status: "available" },
  { type: "police",    location: { lat: 17.3750, lng: 78.4700 }, status: "available" },
  { type: "fire",      location: { lat: 17.3850, lng: 78.5050 }, status: "available" },
  { type: "fire",      location: { lat: 17.3650, lng: 78.4850 }, status: "available" },
  { type: "fire",      location: { lat: 17.4050, lng: 78.4650 }, status: "available" },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI, { family: 4 });
  await Vehicle.deleteMany({});
  await Vehicle.insertMany(vehicles);
  console.log(`Seeded ${vehicles.length} vehicles`);
  await mongoose.disconnect();
}

seed().catch(console.error);
