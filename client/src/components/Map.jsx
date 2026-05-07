import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icon resolution issue with bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

const VEHICLE_COLORS = {
  ambulance: "blue",
  police: "orange",
  fire: "purple",
};

const getVehicleIcon = (type) => {
  const color = VEHICLE_COLORS[type] || "red";
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });
};

const movingIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/2972/2972185.png",
  iconSize: [35, 35],
});

const userIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [30, 30],
});

function Map({ activeVehicle, vehicleType, target, route, allVehicles }) {
  const center = [17.385, 78.4867];

  const formattedRoute =
    route && route.length > 0
      ? route
          .filter(p => p && (Array.isArray(p) || (p.lat !== undefined && p.lng !== undefined)))
          .map(p => (Array.isArray(p) ? p : [p.lat, p.lng]))
      : [];

  return (
    <MapContainer
      center={center}
      zoom={13}
      style={{ height: "500px", width: "100%" }}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {allVehicles?.map((v) => (
        <Marker
          key={v._id}
          position={[v.location.lat, v.location.lng]}
          icon={getVehicleIcon(v.type)}
        />
      ))}

      {target?.lat && target?.lng && (
        <Marker position={[target.lat, target.lng]} icon={userIcon} />
      )}

      {formattedRoute.length > 1 && (
        <Polyline positions={formattedRoute} color="red" />
      )}

      {activeVehicle && (
        <Marker
          position={[activeVehicle.lat, activeVehicle.lng]}
          icon={movingIcon}
        />
      )}
    </MapContainer>
  );
}

export default Map;
