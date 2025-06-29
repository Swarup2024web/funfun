const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files from root directory
app.use(express.static(__dirname));

// Store users
const users = new Map();

io.on("connection", (socket) => {
  socket.on("user-joined", (user) => {
    users.set(socket.id, { ...user, socketId: socket.id });
    updateUserList();
  });

  socket.on("group-message", (data) => {
    io.emit("receive-group-message", data);
  });

  socket.on("private-message", ({ from, to, message }) => {
    const recipient = [...users.values()].find((u) => u.username === to);
    if (recipient) {
      io.to(recipient.socketId).emit("receive-private-message", { from, message });
    }
  });

  socket.on("disconnect", () => {
    users.delete(socket.id);
    updateUserList();
  });

  function updateUserList() {
    const userArray = [...users.values()];
    io.emit("update-user-list", userArray);
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
