const socket = io();

// Get DOM elements
const loginContainer = document.getElementById("login-container");
const chatContainer = document.getElementById("chat-container");
const usernameInput = document.getElementById("username");
const genderInput = document.getElementById("gender");
const ageInput = document.getElementById("age");
const messagesDiv = document.getElementById("messages");
const groupMessageInput = document.getElementById("groupMessage");
const privateMessageInput = document.getElementById("privateMessage");
const privateUsersSelect = document.getElementById("privateUsers");
const userList = document.getElementById("userList");

// Store current user in localStorage
function joinChat() {
  const username = usernameInput.value.trim();
  const gender = genderInput.value;
  const age = ageInput.value;

  if (!username || !age) return alert("Please fill all fields");

  const user = { username, gender, age };
  localStorage.setItem("funfun-user", JSON.stringify(user));
  socket.emit("user-joined", user);

  loginContainer.classList.add("hidden");
  chatContainer.classList.remove("hidden");
}

function logoutUser() {
  localStorage.removeItem("funfun-user");
  window.location.reload();
}

function sendGroupMessage() {
  const msg = groupMessageInput.value.trim();
  if (!msg) return;
  const user = JSON.parse(localStorage.getItem("funfun-user"));
  socket.emit("group-message", { user: user.username, message: msg });
  groupMessageInput.value = "";
}

function sendPrivateMessage() {
  const msg = privateMessageInput.value.trim();
  const to = privateUsersSelect.value;
  if (!msg || !to) return;
  const user = JSON.parse(localStorage.getItem("funfun-user"));
  socket.emit("private-message", { from: user.username, to, message: msg });
  appendMessage(`You to ${to}: ${msg}`);
  privateMessageInput.value = "";
}

function appendMessage(text) {
  const p = document.createElement("p");
  p.textContent = text;
  messagesDiv.appendChild(p);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

socket.on("receive-group-message", (data) => {
  appendMessage(`${data.user}: ${data.message}`);
});

socket.on("receive-private-message", ({ from, message }) => {
  appendMessage(`Private from ${from}: ${message}`);
});

socket.on("update-user-list", (users) => {
  const currentUser = JSON.parse(localStorage.getItem("funfun-user"));
  privateUsersSelect.innerHTML = "";
  userList.innerHTML = "";
  users.forEach((user) => {
    const li = document.createElement("li");
    li.textContent = user.username;
    userList.appendChild(li);

    if (user.username !== currentUser.username) {
      const opt = document.createElement("option");
      opt.value = user.username;
      opt.textContent = user.username;
      privateUsersSelect.appendChild(opt);
    }
  });
});

// Auto-login if data exists
window.onload = () => {
  const saved = localStorage.getItem("funfun-user");
  if (saved) {
    const user = JSON.parse(saved);
    usernameInput.value = user.username;
    genderInput.value = user.gender;
    ageInput.value = user.age;
    joinChat();
  }
};
