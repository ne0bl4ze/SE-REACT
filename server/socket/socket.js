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

    // ================= JOIN REQUEST =================
    socket.on("join_request", async (requestId) => {
      console.log("📥 Joining room:", requestId);

      socket.join(requestId);

      try {
        let attempts = 0;

        // 🔥 GUARANTEED ROUTE DELIVERY FUNCTION
        const sendRoute = async () => {
          const request = await Request.findById(requestId);

          console.log(
            `🔍 Checking route (attempt ${attempts}):`,
            request?.route?.length
          );

          // ✅ ROUTE AVAILABLE → SEND
          if (request?.route?.length > 0) {
            console.log("📤 Sending route to client:", request.route.length);

            socket.emit("route_data", {
              route: request.route,
            });

            return;
          }

          // 🔁 RETRY (handles async DB delay)
          if (attempts < 10) {
            attempts++;
            setTimeout(sendRoute, 300);
          } else {
            console.log("❌ Route not available after retries");
          }
        };

        sendRoute();

      } catch (err) {
        console.log("❌ Error fetching route:", err.message);
      }
    });

    // ================= DISCONNECT =================
    socket.on("disconnect", () => {
      console.log("❌ Client disconnected:", socket.id);
    });
  });
}

// ================= GET IO =================
function getIO() {
  if (!io) throw new Error("Socket not initialized");
  return io;
}

module.exports = { initSocket, getIO };