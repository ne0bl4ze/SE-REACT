import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../config";

function Admin() {
  const [vehicles, setVehicles] = useState([]);
  const [error, setError] = useState("");

  const fetchVehicles = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/vehicles`);
      setVehicles(res.data);
    } catch {
      setError("Failed to load vehicles.");
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await axios.post(`${API_URL}/api/vehicles/update-status/${id}`, { status });
      fetchVehicles();
    } catch {
      setError("Failed to update vehicle status.");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Admin Dashboard</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {vehicles.map((v) => (
        <div key={v._id} style={{
          background: "white",
          padding: "15px",
          marginBottom: "10px",
          borderRadius: "10px",
        }}>
          <h3>{v.type}</h3>
          <p>Status: {v.status}</p>

          <button onClick={() => updateStatus(v._id, "available")}>
            Available
          </button>

          <button onClick={() => updateStatus(v._id, "busy")}>
            Busy
          </button>
        </div>
      ))}
    </div>
  );
}

export default Admin;
