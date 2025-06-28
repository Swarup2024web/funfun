// server.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const users = new Map();

// Serve static files (index.html, script.js, etc.)
app.use(express.static(path.join(__dirname)));

// Handle socket connection
io.on("connection", (socket) => {
  console.log("🔌 New user connected:", socket.id);

  // When a user joins
  socket.on("user-joined", (userData) => {
    users.set(socket.id, { ...userData, socketId: socket.id });
    io.emit("update-user-list", Array.from(users.values()));
  });

  // Group message
  socket.on("group-message", ({ username, message }) => {
    io.emit("receive-group-message", { username, message });
  });

  // Private message
  socket.on("private-message", ({ from, to, message }) => {
    for (let [id, user] of users.entries()) {
      if (user.username === to) {
        io.to(id).emit("receive-private-message", { from, message });
        break;
      }
    }
  });

  // User disconnects
  socket.on("disconnect", () => {
    users.delete(socket.id);
    io.emit("update-user-list", Array.from(users.values()));
    console.log("❌ User disconnected:", socket.id);
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
