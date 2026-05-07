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
      navigate("/map", { state: { requestId: res.data.requestId, type, lat, lng } });
    } catch {
      alert("No vehicles available. Please try again shortly.");
      setLoading(false);
    }
  };

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
          <Link to="/admin">Officer Login</Link>
          <Link to="/" className="nav-cta">Request Help</Link>
        </div>
      </nav>

      <div className="request-page">
        <div className="request-card">
          <div className="request-card-header">
            <div className="badge">Emergency Dispatch</div>
            <h1>Request Emergency Response</h1>
            <p>Select the type of help needed. The nearest available unit will be dispatched immediately.</p>
          </div>
          <EmergencyForm onRequest={handleRequest} loading={loading} />
        </div>
      </div>
    </>
  );
}

export default RequestPage;
