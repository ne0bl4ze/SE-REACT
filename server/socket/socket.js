const { Server } = require("socket.io");
const Request = require("../models/Request");

let io;

function initSocket(server) {
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [
    "http://localhost:3000",
  ];

  io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("✅ Client connected:", socket.id);

    // 🔥 JOIN ROOM (CRITICAL)
    socket.on("join_request", async (requestId) => {
      console.log("📥 Joining room:", requestId);
      socket.join(requestId);

      try {
        const request = await Request.findById(requestId);

        // ✅ SEND STORED ROUTE (FOR REFRESH CASE)
        if (request?.route?.length > 0) {
          console.log("📤 Sending stored route:", request.route.length);

          socket.emit("route_data", {
            route: request.route,
          });
        }
      } catch (err) {
        console.log("❌ Error fetching stored route:", err.message);
      }
    });

    socket.on("disconnect", () => {
      console.log("❌ Client disconnected:", socket.id);
    });
  });
}

function getIO() {
  if (!io) throw new Error("Socket not initialized");
  return io;
}

module.exports = { initSocket, getIO };