const socket = io("http://localhost:3000");
let userId = null;

function joinChat() {
    const username = document.getElementById("username").value;
    const gender = document.getElementById("gender").value;
    const age = document.getElementById("age").value;

    if (!username || !age) return alert("Please fill all fields.");

    userId = socket.id;
    socket.emit("join", { username, gender, age });

    document.getElementById("login-container").style.display = "none";
    document.getElementById("chat-container").style.display = "flex";
}

socket.on("updateUsers", (users) => {
    let userList = document.getElementById("userList");
    let privateUsers = document.getElementById("privateUsers");
    userList.innerHTML = "";
    privateUsers.innerHTML = "";

    users.forEach((user, index) => {
        if (user.username) {
            userList.innerHTML += `<li>${user.username} (${user.gender}, ${user.age})</li>`;
            privateUsers.innerHTML += `<option value="${index}">${user.username}</option>`;
        }
    });
});

function sendGroupMessage() {
    const message = document.getElementById("groupMessage").value;
    if (message) {
        socket.emit("sendGroupMessage", message);
        document.getElementById("groupMessage").value = "";
    }
}

socket.on("receiveGroupMessage", (data) => {
    document.getElementById("messages").innerHTML += `<p><strong>${data.user.username}:</strong> ${data.message}</p>`;
});

function sendPrivateMessage() {
    const message = document.getElementById("privateMessage").value;
    const recipientIndex = document.getElementById("privateUsers").value;
    
    socket.emit("sendPrivateMessage", { recipientId: Object.keys(users)[recipientIndex], message });
    document.getElementById("privateMessage").value = "";
}

socket.on("receivePrivateMessage", (data) => {
    alert(`Private message from ${data.from.username}: ${data.message}`);
});
