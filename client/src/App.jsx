import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import RequestPage from "./pages/RequestPage";
import MapPage from "./pages/MapPage";
import Admin from "./components/Admin";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<RequestPage />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Router>
  );
}

export default App;