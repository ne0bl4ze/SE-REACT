const { Server } = require("socket.io");

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
    console.log("Client connected:", socket.id);

    socket.on("join_request", (requestId) => {
      socket.join(requestId);
      console.log("Joined room:", requestId);
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });
}

function getIO() {
  if (!io) throw new Error("Socket not initialized");
  return io;
}

module.exports = { initSocket, getIO };
