import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import EmergencyForm from "../components/EmergencyForm";

const API_URL = "http://localhost:5000";

function RequestPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleRequest = async (type) => {
    try {
      setLoading(true);

      const lat = 17.385;
      const lng = 78.4867;

      const res = await axios.post(`${API_URL}/api/request-emergency`, {
        userId: "user123",
        emergencyType: type,
        lat,
        lng,
      });

      // ✅ PASS ALL REQUIRED DATA
      navigate("/map", {
        state: {
          requestId: res.data.requestId,
          type,
          lat,
          lng,
        },
      });

    } catch {
      alert("No vehicles available");
      setLoading(false);
    }
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h1>🚨 Emergency System</h1>

      <div>
        <a href="/admin">Admin</a>
      </div>

      <EmergencyForm onRequest={handleRequest} />

      {loading && <p>Finding vehicle...</p>}
    </div>
  );
}

export default RequestPage;