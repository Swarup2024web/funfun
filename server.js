const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

let users = [];

io.on('connection', socket => {
    console.log('A user connected');

    socket.on('user-joined', data => {
        users.push({ id: socket.id, username: data.username });
        io.emit('update-user-list', users);
    });

    socket.on('group-message', data => {
        io.emit('receive-group-message', data);
    });

    socket.on('private-message', ({ from, to, message }) => {
        const target = users.find(u => u.username === to);
        if (target) {
            io.to(target.id).emit('receive-private-message', { from, message });
        }
    });

    socket.on('disconnect', () => {
        users = users.filter(u => u.id !== socket.id);
        io.emit('update-user-list', users);
        console.log('A user disconnected');
    });
});

http.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
