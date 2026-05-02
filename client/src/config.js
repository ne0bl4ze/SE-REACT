// API Configuration
export const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

// Map Configuration
export const DEFAULT_LATITUDE = parseFloat(process.env.REACT_APP_DEFAULT_LAT || "17.385");
export const DEFAULT_LONGITUDE = parseFloat(process.env.REACT_APP_DEFAULT_LNG || "78.4867");
export const DEFAULT_ZOOM = parseInt(process.env.REACT_APP_DEFAULT_ZOOM || "13", 10);
