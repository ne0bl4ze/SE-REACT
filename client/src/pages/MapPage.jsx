import { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import Map from "../components/Map";
import useSocket from "../hooks/useSocket";
import { API_URL } from "../config";

const STATUS_LABELS = { on_the_way: "En Route", reached: "Reached", assigned: "Assigned" };
const badgeClass = (s) =>
  s === "reached" ? "badge-reached" : s ? "badge-on-way" : "badge-waiting";

function MapPage() {
  const socket = useSocket();
  const location = useLocation();
  const navigate = useNavigate();

  const requestId   = location.state?.requestId;
  const vehicleType = location.state?.type;

  const [activeVehicle, setActiveVehicle] = useState(null);
  const [target]  = useState({ lat: location.state?.lat, lng: location.state?.lng });
  const [route, setRoute]             = useState([]);
  const [allVehicles, setAllVehicles] = useState([]);
  const [eta, setEta]                 = useState(null);
  const [status, setStatus]           = useState("");
  const [completed, setCompleted]     = useState(false);

  useEffect(() => { if (!requestId) navigate("/"); }, [requestId, navigate]);

  useEffect(() => {
    axios.get(`${API_URL}/api/vehicles`).then(r => setAllVehicles(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!requestId) return;
    axios.get(`${API_URL}/api/request/${requestId}`)
      .then(r => { if (r.data.route?.length > 0) setRoute(r.data.route); })
      .catch(() => {});
  }, [requestId]);

  useEffect(() => {
    if (!socket || !requestId) return;
    socket.emit("join_request", requestId);
    socket.on("route_data",    (d) => { if (d.route) setRoute(d.route); });
    socket.on("vehicle_update", (d) => {
      if (d.cancelled) { navigate("/"); return; }
      if (d.completed) { setCompleted(true); setStatus("reached"); return; }
      if (d.lat !== undefined) setActiveVehicle({ lat: d.lat, lng: d.lng });
      if (d.eta !== undefined) setEta(d.eta);
      if (d.status) setStatus(d.status);
    });
    return () => { socket.off("route_data"); socket.off("vehicle_update"); };
  }, [socket, requestId, navigate]);

  const cancelRequest = async () => {
    try { await axios.post(`${API_URL}/api/cancel-request/${requestId}`); } catch {}
    navigate("/");
  };

  const displayStatus = STATUS_LABELS[status] || status || "Waiting";

  return (
    <>
      <nav className="navbar">
        <Link to="/" className="navbar-brand">
          <div className="brand-badge">112</div>
          <div>
            <div className="brand-title">REACT</div>
            <div className="brand-sub">Emergency Response</div>
          </div>
        </Link>
        <div className="navbar-links">
          <Link to="/">Home</Link>
          <Link to="/admin">Officer Login</Link>
        </div>
      </nav>

      <div className="map-page">
        <Map
          activeVehicle={activeVehicle}
          vehicleType={vehicleType}
          target={target}
          route={route}
          allVehicles={allVehicles}
        />

        <div className="map-overlay">
          <div className="status-card">
            <h3>Dispatch Status</h3>
            <div className="status-row">
              <span>Status</span>
              <span className={`status-badge ${badgeClass(status)}`}>{displayStatus}</span>
            </div>
            <div className="status-row">
              <span>ETA</span>
              <span>
                {eta !== null
                  ? <><span className="eta-value">{eta.toFixed(1)}</span><span className="eta-unit">min</span></>
                  : <span style={{ fontSize: 12, color: "var(--muted)" }}>Calculating…</span>
                }
              </span>
            </div>
            {vehicleType && (
              <div className="status-row">
                <span>Unit</span>
                <span style={{ fontSize: 12, fontWeight: 600, textTransform: "capitalize", color: "var(--navy)" }}>
                  {vehicleType}
                </span>
              </div>
            )}
          </div>

          {!completed && (
            <button className="cancel-btn" onClick={cancelRequest}>Cancel Request</button>
          )}
        </div>

      </div>

      {completed && (
        <div className="arrival-backdrop">
          <div className="arrival-modal">
            <div className="arrival-icon">
              {vehicleType === "ambulance" ? "🚑" : vehicleType === "police" ? "🚓" : "🔥"}
            </div>
            <h2>Help Has Arrived</h2>
            <p>
              Your {vehicleType || "emergency unit"} has reached your location.
              Stay calm — assistance is with you.
            </p>
            <button className="arrival-btn" onClick={() => navigate("/")}>
              Back to Home
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default MapPage;
