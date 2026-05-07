require("dotenv").config();

const express = require("express");
const http = require("http");
const cors = require("cors");

const connectDB = require("./config/db");
const { initSocket } = require("./socket/socket");

const requestRoutes = require("./routes/requestRoutes");
const vehicleRoutes = require("./routes/vehicleRoutes");

const app = express();
const server = http.createServer(app);

// DB
connectDB();

// Middleware
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || ["http://localhost:3000"];
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

// 🔥 FIXED ROUTES
app.use("/api", requestRoutes);           // request routes
app.use("/api/vehicles", vehicleRoutes);  // ✅ FIXED HERE

// Socket
initSocket(server);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});