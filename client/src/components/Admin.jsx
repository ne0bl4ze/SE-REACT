import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000";

function Admin() {
  const [vehicles, setVehicles] = useState([]);

  const fetchVehicles = async () => {
    const res = await axios.get(`${API_URL}/api/vehicles`);
    setVehicles(res.data);
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const updateStatus = async (id, status) => {
    await axios.post(`${API_URL}/api/vehicles/update-status/${id}`, { status });
    fetchVehicles();
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>🚨 Admin Dashboard</h2>

      {vehicles.map((v) => (
        <div key={v._id} style={{
          background: "white",
          padding: "15px",
          marginBottom: "10px",
          borderRadius: "10px"
        }}>
          <h3>{v.type}</h3>
          <p>Status: {v.status}</p>

          <button onClick={() => updateStatus(v._id, "available")}>
            Available
          </button>

          <button onClick={() => updateStatus(v._id, "busy")}>
            Assigned
          </button>
        </div>
      ))}
    </div>
  );
}

export default Admin;