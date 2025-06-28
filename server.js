const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Serve static files (HTML, CSS, JS)
app.use(express.static(__dirname + '/public'));

// Store users: { socketId: { username, gender, age } }
let users = {};

io.on('connection', (socket) => {
    console.log('New user connected:', socket.id);

    // When user joins
    socket.on('user-joined', (userData) => {
        users[socket.id] = {
            username: userData.username,
            gender: userData.gender,
            age: userData.age
        };

        console.log(`${userData.username} joined.`);

        // Update all clients with user list
        updateUserList();
    });

    // Handle group message
    socket.on('group-message', (data) => {
        io.emit('receive-group-message', {
            username: data.username,
            message: data.message
        });
    });

    // Handle private message
    socket.on('private-message', (data) => {
        const recipientSocketId = Object.keys(users).find(
            key => users[key].username === data.to
        );

        if (recipientSocketId) {
            io.to(recipientSocketId).emit('receive-private-message', {
                from: data.from,
                message: data.message
            });
        }
    });

    // When a user disconnects
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        delete users[socket.id];
        updateUserList();
    });
});

// Helper to send updated user list to all
function updateUserList() {
    const userArray = Object.values(users);
    io.emit('update-user-list', userArray);
}

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`FunFun Chat server running on http://localhost:${PORT}`);
});
