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

// ── CREATE ──────────────────────────────────────────────────────────────────
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
      if (!isNaN(d) && d < minDist) { minDist = d; nearest = v; }
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

    // ── ROUTE via OSRM (free, no key, real roads) ──────────────────────────
    let coords = [];

    try {
      const osrmRes = await axios.get(
        `http://router.project-osrm.org/route/v1/driving/` +
        `${nearest.location.lng},${nearest.location.lat};${parsedLng},${parsedLat}`,
        { params: { overview: "full", geometries: "geojson" } }
      );
      coords = osrmRes.data.routes[0].geometry.coordinates; // [[lng, lat], ...]
    } catch {
      // straight-line fallback
      coords = [
        [nearest.location.lng, nearest.location.lat],
        [parsedLng, parsedLat],
      ];
    }

    const formattedRoute = coords.map(([cLng, cLat]) => ({ lat: cLat, lng: cLng }));
    request.route = formattedRoute;
    await request.save();

    // Push route to any client already waiting in the room
    io.to(requestId).emit("route_data", { route: formattedRoute });

    // ── MOVEMENT SIMULATION ────────────────────────────────────────────────
    // Spread the trip over ~40 seconds regardless of route length
    const TRIP_MS   = 40000;
    const tickMs    = Math.max(150, Math.round(TRIP_MS / coords.length));
    let   stepIndex = 0;

    const interval = setInterval(async () => {
      stepIndex++;

      if (stepIndex >= coords.length) {
        clearInterval(interval);
        delete activeTrips[requestId];

        await Vehicle.findByIdAndUpdate(nearest._id, { status: "available" });

        const [finalLng, finalLat] = coords[coords.length - 1];
        io.to(requestId).emit("vehicle_update", {
          lat: finalLat, lng: finalLng,
          status: "reached", eta: 0, completed: true,
        });
        return;
      }

      const [cLng, cLat] = coords[stepIndex];
      const remainingMs  = (coords.length - stepIndex) * tickMs;
      const eta          = remainingMs / 60000; // minutes

      io.to(requestId).emit("vehicle_update", {
        lat: cLat, lng: cLng,
        status: "on_the_way", eta,
      });
    }, tickMs);

    activeTrips[requestId] = interval;
    res.status(201).json({ requestId });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// ── CANCEL ───────────────────────────────────────────────────────────────────
exports.cancelRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await Request.findById(id);
    if (!request) return res.status(404).json({ message: "Not found" });

    request.status = "cancelled";
    await request.save();

    await Vehicle.findByIdAndUpdate(request.assignedVehicle, { status: "available" });

    if (activeTrips[id]) { clearInterval(activeTrips[id]); delete activeTrips[id]; }

    getIO().to(id).emit("vehicle_update", { cancelled: true });
    res.json({ message: "Cancelled" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── ADMIN ────────────────────────────────────────────────────────────────────
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

// ── GET ──────────────────────────────────────────────────────────────────────
exports.getRequestById = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Not found" });
    res.json(request);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
