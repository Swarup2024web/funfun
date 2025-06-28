const socket = io();

// Elements
const loginContainer = document.getElementById("login-container");
const chatContainer = document.getElementById("chat-container");
const userList = document.getElementById("userList");
const privateUsers = document.getElementById("privateUsers");
const groupInput = document.getElementById("groupMessage");
const privateInput = document.getElementById("privateMessage");
const messagesDiv = document.getElementById("messages");

// User data
let currentUsername = localStorage.getItem("funfun-username");
let currentUserData = localStorage.getItem("funfun-userdata");

if (currentUsername && currentUserData) {
  currentUserData = JSON.parse(currentUserData);
  loginContainer.style.display = "none";
  chatContainer.style.display = "block";
  socket.emit("user-joined", currentUserData);
}

// Join chat
function joinChat() {
  const username = document.getElementById("username").value.trim();
  const gender = document.getElementById("gender").value;
  const age = document.getElementById("age").value.trim();

  if (!username || !age) {
    alert("Please fill in all fields.");
    return;
  }

  const userData = { username, gender, age };
  currentUsername = username;
  currentUserData = userData;

  // Store in localStorage
  localStorage.setItem("funfun-username", username);
  localStorage.setItem("funfun-userdata", JSON.stringify(userData));

  socket.emit("user-joined", userData);

  loginContainer.style.display = "none";
  chatContainer.style.display = "block";
}

// Group message
function sendGroupMessage() {
  const message = groupInput.value.trim();
  if (message) {
    socket.emit("group-message", { username: currentUsername, message });
    groupInput.value = "";
  }
}

// Private message
function sendPrivateMessage() {
  const toUser = privateUsers.value;
  const message = privateInput.value.trim();
  if (toUser && message) {
    socket.emit("private-message", { from: currentUsername, to: toUser, message });
    messagesDiv.innerHTML += `<p><strong>To ${toUser} (private):</strong> ${message}</p>`;
    privateInput.value = "";
  }
}

// Receive group message
socket.on("receive-group-message", ({ username, message }) => {
  messagesDiv.innerHTML += `<p><strong>${username}:</strong> ${message}</p>`;
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
});

// Receive private message
socket.on("receive-private-message", ({ from, message }) => {
  messagesDiv.innerHTML += `<p style="background:#ffd"><strong>${from} (private):</strong> ${message}</p>`;
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
});

// Update user list
socket.on("update-user-list", (users) => {
  userList.innerHTML = "";
  privateUsers.innerHTML = "";

  users.forEach((user) => {
    if (user.username !== currentUsername) {
      const li = document.createElement("li");
      li.textContent = `${user.username} (${user.gender}, ${user.age})`;
      userList.appendChild(li);

      const option = document.createElement("option");
      option.value = user.username;
      option.textContent = user.username;
      privateUsers.appendChild(option);
    }
  });
});

// Logout
function logoutUser() {
  localStorage.removeItem("funfun-username");
  localStorage.removeItem("funfun-userdata");
  location.reload();
          }
