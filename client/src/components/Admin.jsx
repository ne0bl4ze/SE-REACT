import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { API_URL } from "../config";

const ICONS = { ambulance: "🚑", police: "🚓", fire: "🔥" };

function Admin() {
  const [vehicles, setVehicles] = useState([]);
  const [error, setError] = useState("");

  const fetchVehicles = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/vehicles`);
      setVehicles(res.data);
    } catch {
      setError("Failed to load vehicles. Is the server running?");
    }
  };

  useEffect(() => { fetchVehicles(); }, []);

  const updateStatus = async (id, status) => {
    try {
      await axios.post(`${API_URL}/api/vehicles/update-status/${id}`, { status });
      fetchVehicles();
    } catch {
      setError("Failed to update vehicle status.");
    }
  };

  const counts = vehicles.reduce((acc, v) => {
    acc[v.status] = (acc[v.status] || 0) + 1;
    return acc;
  }, {});

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
          <Link to="/" className="nav-cta">Request Help</Link>
        </div>
      </nav>

      <div className="admin-page">
        <div className="admin-header">
          <div className="section-label">Officer Portal</div>
          <h1>Fleet Management</h1>
          <p>
            {vehicles.length} vehicles registered &mdash;&nbsp;
            <span style={{ color: "var(--success)", fontWeight: 600 }}>{counts.available || 0} available</span>
            {" · "}
            <span style={{ color: "var(--red)", fontWeight: 600 }}>{counts.busy || 0} on duty</span>
          </p>
        </div>

        {error && <div className="admin-error">{error}</div>}

        <div className="vehicle-grid">
          {vehicles.map((v) => (
            <div key={v._id} className="vehicle-card">
              <div className="vehicle-card-top">
                <div className="vehicle-type">
                  <div className={`vehicle-icon-wrap icon-${v.type}`}>
                    {ICONS[v.type] || "🚗"}
                  </div>
                  <span className="vehicle-name">{v.type}</span>
                </div>
                <span className={`vehicle-status ${v.status === "available" ? "status-available" : "status-busy"}`}>
                  {v.status === "available" ? "Available" : "On Duty"}
                </span>
              </div>

              <div className="vehicle-actions">
                <button
                  className="action-btn available"
                  onClick={() => updateStatus(v._id, "available")}
                  disabled={v.status === "available"}
                >
                  Set Available
                </button>
                <button
                  className="action-btn busy"
                  onClick={() => updateStatus(v._id, "busy")}
                  disabled={v.status === "busy"}
                >
                  Set On Duty
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default Admin;
