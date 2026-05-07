import React, { useState } from "react";

const TYPES = [
  { value: "ambulance", icon: "🚑", label: "Ambulance", sub: "Medical emergency" },
  { value: "police",    icon: "🚓", label: "Police",    sub: "Law enforcement" },
  { value: "fire",      icon: "🔥", label: "Fire Truck", sub: "Fire & rescue" },
];

function EmergencyForm({ onRequest, loading }) {
  const [type, setType] = useState("ambulance");

  return (
    <>
      <div className="type-grid">
        {TYPES.map((t) => (
          <div
            key={t.value}
            className={`type-card ${type === t.value ? "selected" : ""}`}
            onClick={() => setType(t.value)}
          >
            <div className="icon">{t.icon}</div>
            <div className="label">{t.label}</div>
            <div className="sublabel">{t.sub}</div>
          </div>
        ))}
      </div>

      <button
        className="request-btn"
        onClick={() => onRequest(type)}
        disabled={loading}
      >
        {loading ? "Dispatching..." : "Request Emergency Response"}
      </button>

      {loading && <div className="loading-bar" />}
    </>
  );
}

export default EmergencyForm;
