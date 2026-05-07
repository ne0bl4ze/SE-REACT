const Request = require("../models/Request");
const Vehicle = require("../models/Vehicle");
const { getIO } = require("../socket/socket");
const axios = require("axios");

function getDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const activeTrips = {};

// ================= CREATE =================
exports.createRequest = async (req, res) => {
  try {
    const { userId, emergencyType, lat, lng } = req.body;

    if (!userId || !emergencyType || lat == null || lng == null) {
      return res.status(400).json({ message: "userId, emergencyType, lat, and lng are required" });
    }

    const parsedLat = parseFloat(lat);
    const parsedLng = parseFloat(lng);

    if (isNaN(parsedLat) || isNaN(parsedLng)) {
      return res.status(400).json({ message: "lat and lng must be valid numbers" });
    }

    const vehicles = await Vehicle.find({
      status: "available",
      type: { $regex: `^${emergencyType}$`, $options: "i" },
    });

    const validVehicles = vehicles.filter(
      (v) => v.location?.lat !== undefined && v.location?.lng !== undefined
    );

    if (validVehicles.length === 0) {
      return res.status(503).json({ message: "No vehicles available" });
    }

    let nearest = validVehicles[0];
    let minDist = Infinity;

    for (const v of validVehicles) {
      const d = getDistance(parsedLat, parsedLng, v.location.lat, v.location.lng);
      if (!isNaN(d) && d < minDist) {
        minDist = d;
        nearest = v;
      }
    }

    nearest.status = "busy";
    await nearest.save();

    const request = await Request.create({
      userId,
      emergencyType,
      location: { lat: parsedLat, lng: parsedLng },
      assignedVehicle: nearest._id,
      status: "assigned",
    });

    const requestId = request._id.toString();
    const io = getIO();

    // ================= ROUTE =================
    let coords = [];

    try {
      const routeRes = await axios.get(
        "https://api.openrouteservice.org/v2/directions/driving-car",
        {
          headers: { Authorization: process.env.ORS_API_KEY },
          params: {
            start: `${nearest.location.lng},${nearest.location.lat}`,
            end: `${parsedLng},${parsedLat}`,
          },
        }
      );
      coords = routeRes.data.features[0].geometry.coordinates;
    } catch {
      coords = [
        [nearest.location.lng, nearest.location.lat],
        [parsedLng, parsedLat],
      ];
    }

    const formattedRoute = coords.map(([cLng, cLat]) => ({ lat: cLat, lng: cLng }));

    request.route = formattedRoute;
    await request.save();

    // Push route to any client already in the room
    io.to(requestId).emit("route_data", { route: formattedRoute });

    // ================= MOVEMENT =================
    let currentIndex = 0;
    let progress = 0;

    const interval = setInterval(async () => {
      if (currentIndex >= coords.length - 1) {
        clearInterval(interval);
        delete activeTrips[requestId];

        await Vehicle.findByIdAndUpdate(nearest._id, { status: "available" });

        const [finalLng, finalLat] = coords[coords.length - 1];

        io.to(requestId).emit("vehicle_update", {
          lat: finalLat,
          lng: finalLng,
          status: "reached",
          eta: 0,
          completed: true,
        });

        return;
      }

      const [lng1, lat1] = coords[currentIndex];
      const [lng2, lat2] = coords[currentIndex + 1];

      const curLat = lat1 + (lat2 - lat1) * progress;
      const curLng = lng1 + (lng2 - lng1) * progress;

      const remainingSegments = coords.length - 1 - currentIndex;
      const eta = (remainingSegments * 0.3 * 10) / 60; // 300ms/step * 10 steps/segment → minutes

      io.to(requestId).emit("vehicle_update", {
        lat: curLat,
        lng: curLng,
        status: "on_the_way",
        eta,
      });

      progress += 0.1;

      if (progress >= 1) {
        progress = 0;
        currentIndex++;
      }
    }, 300);

    activeTrips[requestId] = interval;

    res.status(201).json({ requestId });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// ================= CANCEL =================
exports.cancelRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await Request.findById(id);
    if (!request) return res.status(404).json({ message: "Not found" });

    request.status = "cancelled";
    await request.save();

    await Vehicle.findByIdAndUpdate(request.assignedVehicle, { status: "available" });

    if (activeTrips[id]) {
      clearInterval(activeTrips[id]);
      delete activeTrips[id];
    }

    getIO().to(id).emit("vehicle_update", { cancelled: true });

    res.json({ message: "Cancelled" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ================= ADMIN =================
exports.updateVehicleStatus = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });

    vehicle.status = req.body.status;
    await vehicle.save();

    res.json({ message: "Vehicle updated" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ================= GET =================
exports.getRequestById = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Not found" });
    res.json(request);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
