import React, { useState, useEffect } from "react";
import EmergencyForm from "./components/EmergencyForm";
import Map from "./components/Map";
import useSocket from "./hooks/useSocket";
import axios from "axios";
import "./App.css";

function App() {
  const socket = useSocket();

  const [activeRequest, setActiveRequest] = useState(null);
  const [activeVehicle, setActiveVehicle] = useState(null);
  const [status, setStatus] = useState("");
  const [eta, setEta] = useState(null);
  const [completed, setCompleted] = useState(false);

  // SOCKET LISTENER
  useEffect(() => {
    if (!socket) return;

    socket.on("vehicle_update", (data) => {
      if (data.completed) {
        setActiveVehicle({ lat: data.lat, lng: data.lng });
        setStatus("reached");
        setEta(0);
        setCompleted(true);
        return;
      }

      if (data.lat && data.lng && !completed) {
        setActiveVehicle({ lat: data.lat, lng: data.lng });
        setStatus(data.status);
        setEta(data.eta);
      }
    });

    return () => socket.off("vehicle_update");
  }, [socket, completed]);

  // REQUEST
  const handleRequest = async (type) => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/request-emergency",
        {
          userId: "dummyUser",
          emergencyType: type,
          lat: 17.385,
          lng: 78.4867,
        }
      );

      setActiveRequest(res.data.requestId);
      setCompleted(false);
    } catch (err) {
      console.error(err);
    }
  };

  // CANCEL
  const handleCancel = async () => {
    try {
      await axios.post(
        `http://localhost:5000/api/cancel-request/${activeRequest}`
      );

      setActiveRequest(null);
      setActiveVehicle(null);
      setStatus("");
      setEta(null);
      setCompleted(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      {/* HEADER */}
      <div className="header">
        🚨 Emergency System
        <div className="nav">
          <a href="/">Home</a>
          <a href="/admin">Admin</a>
        </div>
      </div>

      <div className="container">
        {!activeRequest && <EmergencyForm onRequest={handleRequest} />}

        {activeRequest && (
          <button className="cancelBtn" onClick={handleCancel}>
            Cancel Request
          </button>
        )}

        {status && (
          <div className="statusCard">
            <h3>🚑 Emergency Status</h3>
            <p><b>Status:</b> {status}</p>
            <p>
              <b>ETA:</b>{" "}
              {eta !== null ? `${eta.toFixed(1)} mins` : "Calculating..."}
            </p>

            {status === "reached" && (
              <button
                className="homeBtn"
                onClick={() => window.location.reload()}
              >
                Back to Home
              </button>
            )}
          </div>
        )}

        <Map activeVehicle={activeVehicle} />
      </div>
    </div>
  );
}

export default App;