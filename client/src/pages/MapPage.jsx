import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Map from "../components/Map";
import useSocket from "../hooks/useSocket";

const API_URL = "http://localhost:5000";

function MapPage() {
  const socket = useSocket();
  const location = useLocation();
  const navigate = useNavigate();

  const requestId = location.state?.requestId;
  const vehicleType = location.state?.type;

  const initialTarget = {
    lat: location.state?.lat,
    lng: location.state?.lng,
  };

  const [activeVehicle, setActiveVehicle] = useState(null);
  const [target, setTarget] = useState(initialTarget);
  const [route, setRoute] = useState([]);
  const [allVehicles, setAllVehicles] = useState([]);
  const [eta, setEta] = useState(null);
  const [status, setStatus] = useState("");
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    console.log("✅ ROUTE STATE:", route?.length);
  }, [route]);

  // Load vehicles
  useEffect(() => {
    axios.get(`${API_URL}/api/vehicles`)
      .then(res => setAllVehicles(res.data));
  }, []);

  // ✅ FIXED: allow ANY route length
  useEffect(() => {
    if (!requestId) return;

    axios.get(`${API_URL}/api/request/${requestId}`)
      .then(res => {
        if (res.data.route && res.data.route.length > 0) {
          console.log("✅ DB ROUTE LOADED");
          setRoute(res.data.route);
        }
      })
      .catch(() => {
        console.log("Route fetch fallback used");
      });
  }, [requestId]);

  // Socket events
  useEffect(() => {
    if (!socket || !requestId) return;

    socket.emit("join_request", requestId);

    socket.on("route_data", (data) => {
      console.log("📡 ROUTE RECEIVED:", data);
      if (data.route) setRoute(data.route);
    });

    socket.on("vehicle_update", (data) => {
      console.log("🚗 Vehicle update:", data);

      if (data.cancelled) {
        navigate("/");
        return;
      }

      if (data.completed) {
        setCompleted(true);
        setStatus("Reached");
        return;
      }

      if (data.lat !== undefined) {
        setActiveVehicle({ lat: data.lat, lng: data.lng });
      }

      if (data.eta !== undefined) setEta(data.eta);
      if (data.status) setStatus(data.status);
    });

    return () => {
      socket.off("route_data");
      socket.off("vehicle_update");
    };
  }, [socket, requestId, navigate]);

  const cancelRequest = async () => {
    await axios.post(`${API_URL}/api/cancel-request/${requestId}`);
    navigate("/");
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h2>🚑 Live Tracking</h2>

      <button onClick={cancelRequest}>Cancel</button>

      <div style={{
        position: "absolute",
        top: 100,
        left: 20,
        background: "white",
        padding: "10px",
        borderRadius: "10px",
        zIndex: 1000
      }}>
        <p><b>Status:</b> {status}</p>
        <p><b>ETA:</b> {eta ? eta.toFixed(2) + " mins" : "Calculating..."}</p>
      </div>

      {completed && (
        <div>
          <h3>✅ Vehicle Reached</h3>
          <button onClick={() => navigate("/")}>Back to Home</button>
        </div>
      )}

      <Map
        activeVehicle={activeVehicle}
        vehicleType={vehicleType}
        target={target}
        route={route}
        allVehicles={allVehicles}
      />
    </div>
  );
}

export default MapPage;