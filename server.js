const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: { origin: "*" }
});

let users = {};  // Store users {socketId: {username, gender, age}}

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join", (userData) => {
        users[socket.id] = userData;
        io.emit("updateUsers", Object.values(users)); // Update user list
    });

    socket.on("sendGroupMessage", (message) => {
        io.emit("receiveGroupMessage", { user: users[socket.id], message });
    });

    socket.on("sendPrivateMessage", ({ recipientId, message }) => {
        if (users[recipientId]) {
            io.to(recipientId).emit("receivePrivateMessage", {
                from: users[socket.id],
                message
            });
        }
    });

    socket.on("disconnect", () => {
        delete users[socket.id];
        io.emit("updateUsers", Object.values(users));
        console.log("User disconnected:", socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
