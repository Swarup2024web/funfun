const socket = io();

// Store username globally
let currentUsername = '';

// Join chat
function joinChat() {
    const username = document.getElementById('username').value.trim();
    const gender = document.getElementById('gender').value;
    const age = document.getElementById('age').value.trim();

    if (!username || !age) {
        alert("Please enter your name and age.");
        return;
    }

    currentUsername = username;

    // Hide login, show chat
    document.getElementById('login-container').classList.add('hidden');
    document.getElementById('chat-container').classList.remove('hidden');

    // Emit join event to server
    socket.emit('user-joined', {
        username,
        gender,
        age
    });
}

// Receive updated user list
socket.on('update-user-list', users => {
    const userList = document.getElementById('userList');
    const privateUsers = document.getElementById('privateUsers');

    userList.innerHTML = '';
    privateUsers.innerHTML = '';

    users.forEach(user => {
        // Add to sidebar
        const li = document.createElement('li');
        li.textContent = user.username;
        userList.appendChild(li);

        // Exclude current user from private list
        if (user.username !== currentUsername) {
            const option = document.createElement('option');
            option.value = user.username;
            option.textContent = user.username;
            privateUsers.appendChild(option);
        }
    });
});

// Send group message
function sendGroupMessage() {
    const messageInput = document.getElementById('groupMessage');
    const message = messageInput.value.trim();
    if (!message) return;

    socket.emit('group-message', {
        username: currentUsername,
        message
    });

    messageInput.value = '';
}

// Display group message
socket.on('receive-group-message', data => {
    const { username, message } = data;
    const messagesDiv = document.getElementById('messages');

    const msg = document.createElement('div');
    msg.textContent = `${username}: ${message}`;
    messagesDiv.appendChild(msg);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
});

// Send private message
function sendPrivateMessage() {
    const recipient = document.getElementById('privateUsers').value;
    const message = document.getElementById('privateMessage').value.trim();

    if (!message || !recipient) return;

    socket.emit('private-message', {
        from: currentUsername,
        to: recipient,
        message
    });

    alert(`Private message sent to ${recipient}: ${message}`);
    document.getElementById('privateMessage').value = '';
}

// Receive private message
socket.on('receive-private-message', data => {
    const { from, message } = data;
    alert(`Private message from ${from}: ${message}`);
});
