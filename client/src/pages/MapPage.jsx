import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Map from "../components/Map";
import useSocket from "../hooks/useSocket";
import { API_URL } from "../config";

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
  const [target] = useState(initialTarget);
  const [route, setRoute] = useState([]);
  const [allVehicles, setAllVehicles] = useState([]);
  const [eta, setEta] = useState(null);
  const [status, setStatus] = useState("");
  const [completed, setCompleted] = useState(false);

  // Redirect if navigated here directly without a requestId
  useEffect(() => {
    if (!requestId) navigate("/");
  }, [requestId, navigate]);

  // Load all vehicles for the map
  useEffect(() => {
    axios.get(`${API_URL}/api/vehicles`)
      .then(res => setAllVehicles(res.data))
      .catch(() => {});
  }, []);

  // Fetch persisted route from DB
  useEffect(() => {
    if (!requestId) return;

    axios.get(`${API_URL}/api/request/${requestId}`)
      .then(res => {
        if (res.data.route && res.data.route.length > 0) {
          setRoute(res.data.route);
        }
      })
      .catch(() => {});
  }, [requestId]);

  // Socket events
  useEffect(() => {
    if (!socket || !requestId) return;

    socket.emit("join_request", requestId);

    socket.on("route_data", (data) => {
      if (data.route) setRoute(data.route);
    });

    socket.on("vehicle_update", (data) => {
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
    try {
      await axios.post(`${API_URL}/api/cancel-request/${requestId}`);
    } catch {
      // navigate regardless so the user isn't stuck
    }
    navigate("/");
  };

  return (
    <div style={{ textAlign: "center", position: "relative" }}>
      <h2>Live Tracking</h2>

      <button onClick={cancelRequest}>Cancel</button>

      <div style={{
        position: "absolute",
        top: 100,
        left: 20,
        background: "white",
        padding: "10px",
        borderRadius: "10px",
        zIndex: 1000,
      }}>
        <p><b>Status:</b> {status || "Waiting..."}</p>
        <p><b>ETA:</b> {eta !== null ? eta.toFixed(2) + " mins" : "Calculating..."}</p>
      </div>

      {completed && (
        <div>
          <h3>Vehicle Reached</h3>
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
