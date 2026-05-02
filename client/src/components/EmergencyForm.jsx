import React, { useState } from "react";

function EmergencyForm({ onRequest }) {
  const [type, setType] = useState("ambulance");

  return (
    <div className="form">
      <h2>Request Emergency</h2>

      <select value={type} onChange={(e) => setType(e.target.value)}>
        <option value="ambulance">🚑 Ambulance</option>
        <option value="police">🚓 Police</option>
        <option value="fire">🔥 Fire</option>
      </select>

      <button onClick={() => onRequest(type)}>Request</button>
    </div>
  );
}

export default EmergencyForm;