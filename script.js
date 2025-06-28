const socket = io();
let currentUsername = "";

function joinChat() {
  const username = document.getElementById("username").value.trim();
  const gender = document.getElementById("gender").value;
  const age = document.getElementById("age").value.trim();

  if (!username || !age) return alert("Please enter all fields");

  currentUsername = username;
  localStorage.setItem("funfun-user", JSON.stringify({ username, gender, age }));

  document.getElementById("login-container").style.display = "none";
  document.getElementById("chat-container").style.display = "block";

  socket.emit("user-joined", { username, gender, age });
}

function sendGroupMessage() {
  const msg = document.getElementById("groupMessage").value;
  if (msg.trim()) {
    socket.emit("group-message", { username: currentUsername, message: msg });
    document.getElementById("groupMessage").value = "";
  }
}

function sendPrivateMessage() {
  const toUser = document.getElementById("privateUsers").value;
  const msg = document.getElementById("privateMessage").value;
  if (toUser && msg.trim()) {
    socket.emit("private-message", { from: currentUsername, to: toUser, message: msg });
    appendMessage(`(To ${toUser}) ${currentUsername}: ${msg}`);
    document.getElementById("privateMessage").value = "";
  }
}

function logoutUser() {
  localStorage.removeItem("funfun-user");
  location.reload();
}

function appendMessage(msg) {
  const messagesDiv = document.getElementById("messages");
  const p = document.createElement("p");
  p.textContent = msg;
  p.classList.add("user-message");
  messagesDiv.appendChild(p);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

socket.on("receive-group-message", (data) => {
  appendMessage(`${data.username}: ${data.message}`);
});

socket.on("receive-private-message", ({ from, message }) => {
  appendMessage(`(From ${from}) ${message}`);
});

socket.on("update-user-list", (users) => {
  const userList = document.getElementById("userList");
  const privateSelect = document.getElementById("privateUsers");
  userList.innerHTML = "";
  privateSelect.innerHTML = "";

  users.forEach((user) => {
    if (user.username !== currentUsername) {
      const li = document.createElement("li");
      li.textContent = user.username;
      userList.appendChild(li);

      const option = document.createElement("option");
      option.value = user.username;
      option.textContent = user.username;
      privateSelect.appendChild(option);
    }
  });
});

window.addEventListener("load", () => {
  const saved = localStorage.getItem("funfun-user");
  if (saved) {
    const { username, gender, age } = JSON.parse(saved);
    currentUsername = username;
    document.getElementById("login-container").style.display = "none";
    document.getElementById("chat-container").style.display = "block";
    socket.emit("user-joined", { username, gender, age });
  }
});
