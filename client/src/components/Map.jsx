import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Polyline, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const makeIcon = (svg, size = [36, 36]) =>
  L.divIcon({ html: svg, className: "", iconSize: size, iconAnchor: [size[0] / 2, size[1] / 2] });

const VEHICLE_SVG = {
  ambulance: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36" width="36" height="36">
    <circle cx="18" cy="18" r="16" fill="#1e40af" stroke="#3b82f6" stroke-width="2"/>
    <text x="18" y="24" text-anchor="middle" font-size="18">🚑</text>
  </svg>`,
  police: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36" width="36" height="36">
    <circle cx="18" cy="18" r="16" fill="#92400e" stroke="#f59e0b" stroke-width="2"/>
    <text x="18" y="24" text-anchor="middle" font-size="18">🚓</text>
  </svg>`,
  fire: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36" width="36" height="36">
    <circle cx="18" cy="18" r="16" fill="#991b1b" stroke="#ef4444" stroke-width="2"/>
    <text x="18" y="24" text-anchor="middle" font-size="18">🚒</text>
  </svg>`,
};

const MOVING_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44" width="44" height="44">
  <circle cx="22" cy="22" r="20" fill="#1e3a5f" stroke="#3b82f6" stroke-width="2.5"/>
  <circle cx="22" cy="22" r="20" fill="none" stroke="#3b82f6" stroke-width="2.5" opacity="0.4">
    <animate attributeName="r" values="20;28;20" dur="1.5s" repeatCount="indefinite"/>
    <animate attributeName="opacity" values="0.4;0;0.4" dur="1.5s" repeatCount="indefinite"/>
  </circle>
  <text x="22" y="29" text-anchor="middle" font-size="20">🚨</text>
</svg>`;

const USER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36" width="36" height="36">
  <circle cx="18" cy="18" r="16" fill="#064e3b" stroke="#10b981" stroke-width="2"/>
  <text x="18" y="24" text-anchor="middle" font-size="16">📍</text>
</svg>`;

const getVehicleIcon = (type) => makeIcon(VEHICLE_SVG[type] || VEHICLE_SVG.ambulance);
const movingIcon = makeIcon(MOVING_SVG, [44, 44]);
const userIcon   = makeIcon(USER_SVG);

const TYPE_LABELS = { ambulance: "Ambulance", police: "Police", fire: "Fire Truck" };

// Auto-fits the map to show the entire route + markers
function AutoFit({ route, target }) {
  const map = useMap();

  useEffect(() => {
    if (!route || route.length < 2) return;

    const points = route.map(p => [p.lat, p.lng]);
    if (target?.lat && target?.lng) points.push([target.lat, target.lng]);

    try {
      map.fitBounds(L.latLngBounds(points), { padding: [60, 60], maxZoom: 16 });
    } catch {}
  }, [route, map, target]);

  return null;
}

function Map({ activeVehicle, vehicleType, target, route, allVehicles }) {
  const center = [17.385, 78.4867];

  const formattedRoute =
    route?.length > 0
      ? route
          .filter(p => p && (p.lat !== undefined && p.lng !== undefined))
          .map(p => [p.lat, p.lng])
      : [];

  return (
    <MapContainer
      center={center}
      zoom={13}
      style={{ height: "calc(100vh - 56px)", width: "100vw" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://carto.com">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        subdomains="abcd"
        maxZoom={19}
      />

      <AutoFit route={route} target={target} />

      {allVehicles?.map((v) => (
        <Marker
          key={v._id}
          position={[v.location.lat, v.location.lng]}
          icon={getVehicleIcon(v.type)}
        >
          <Tooltip direction="top" offset={[0, -16]} opacity={0.95}>
            <span style={{ fontSize: 13 }}>
              <b>{TYPE_LABELS[v.type] || v.type}</b><br />
              <span style={{ color: v.status === "available" ? "#15803d" : "#b91c1c" }}>
                {v.status === "available" ? "Available" : "Busy"}
              </span>
            </span>
          </Tooltip>
        </Marker>
      ))}

      {target?.lat && target?.lng && (
        <Marker position={[target.lat, target.lng]} icon={userIcon}>
          <Tooltip direction="top" offset={[0, -16]} opacity={0.95} permanent>
            <span style={{ fontSize: 12 }}>Your location</span>
          </Tooltip>
        </Marker>
      )}

      {formattedRoute.length > 1 && (
        <Polyline
          positions={formattedRoute}
          pathOptions={{ color: "#1d4ed8", weight: 4, opacity: 0.85, dashArray: "8 6" }}
        />
      )}

      {activeVehicle && (
        <Marker position={[activeVehicle.lat, activeVehicle.lng]} icon={movingIcon}>
          <Tooltip direction="top" offset={[0, -20]} opacity={0.95} permanent>
            <span style={{ fontSize: 12 }}>{TYPE_LABELS[vehicleType] || "Vehicle"} en route</span>
          </Tooltip>
        </Marker>
      )}
    </MapContainer>
  );
}

export default Map;
