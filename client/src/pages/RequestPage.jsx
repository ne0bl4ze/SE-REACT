import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import EmergencyForm from "../components/EmergencyForm";
import { API_URL, DEFAULT_LATITUDE, DEFAULT_LONGITUDE } from "../config";

function RequestPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleRequest = async (type) => {
    setLoading(true);
    try {
      const lat = DEFAULT_LATITUDE;
      const lng = DEFAULT_LONGITUDE;

      const res = await axios.post(`${API_URL}/api/request-emergency`, {
        userId: "user123",
        emergencyType: type,
        lat,
        lng,
      });

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
      <h1>Emergency System</h1>

      <div>
        <Link to="/admin">Admin</Link>
      </div>

      <EmergencyForm onRequest={handleRequest} />

      {loading && <p>Finding vehicle...</p>}
    </div>
  );
}

export default RequestPage;
