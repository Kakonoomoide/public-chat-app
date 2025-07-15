document.addEventListener("DOMContentLoaded", () => {
  // State & Variabel
  let socket;
  let userName = "";
  let typingTimer;
  const typingTimeout = 2000; // 2 detik
  const currentlyTyping = {}; // Objek untuk melacak siapa saja yang sedang mengetik

  // --- FITUR BARU: Palet Warna untuk Nama Pengguna ---
  const userColors = [
    "text-red-500",
    "text-blue-500",
    "text-green-500",
    "text-purple-500",
    "text-yellow-500",
    "text-pink-500",
    "text-indigo-500",
    "text-teal-500",
    "text-orange-500",
  ];
  const colorMap = {}; // Menyimpan warna untuk setiap user: { 'username': 'text-red-500' }

  // Selektor DOM
  const loginScreen = document.getElementById("login-screen");
  const menuScreen = document.getElementById("menu-screen");
  const chatScreen = document.getElementById("chat-screen");
  const loginForm = document.getElementById("login-form");
  const nameInput = document.getElementById("name-input");
  const joinPublicBtn = document.getElementById("join-public-btn");
  const createPrivateBtn = document.getElementById("create-private-btn");
  const joinPrivateForm = document.getElementById("join-private-form");
  const privateCodeInput = document.getElementById("private-code-input");
  const chatMessages = document.getElementById("chat-messages");
  const messageForm = document.getElementById("message-form");
  const messageInput = document.getElementById("message-input");
  const roomTitle = document.getElementById("room-title");
  const roomIdDisplay = document.getElementById("room-id-display");
  const exitBtn = document.getElementById("exit-btn");
  const toast = document.getElementById("toast-notification");
  const toastMessage = document.getElementById("toast-message");
  const typingIndicator = document.getElementById("typing-indicator");

  // --- Fungsi Utilitas ---

  function showScreen(screen) {
    loginScreen.classList.add("hidden");
    menuScreen.classList.add("hidden");
    chatScreen.classList.add("hidden");
    screen.classList.remove("hidden");
    screen.classList.add("flex");
  }

  function showToast(message) {
    toastMessage.textContent = message;
    toast.classList.remove("hidden");
    setTimeout(() => toast.classList.add("hidden"), 3000);
  }

  // --- FITUR BARU: Fungsi untuk mendapatkan warna pengguna ---
  function getUserColor(name) {
    if (!colorMap[name]) {
      // Jika user belum punya warna, berikan satu dari palet secara berurutan
      colorMap[name] =
        userColors[Object.keys(colorMap).length % userColors.length];
    }
    return colorMap[name];
  }

  function connectWebSocket(roomId) {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    socket = new WebSocket(`${protocol}//${window.location.host}`);

    socket.onopen = () => {
      socket.send(JSON.stringify({ type: "join", roomId, userName }));
      showScreen(chatScreen);
      roomTitle.textContent =
        roomId === "public-chat-room" ? "Public Chat" : "Private Chat";
      roomIdDisplay.textContent =
        roomId === "public-chat-room" ? "" : `ID: ${roomId}`;
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      handleIncomingMessage(data);
    };

    socket.onclose = () =>
      displayMessage({ type: "info", message: "Koneksi terputus." });
    socket.onerror = (error) => console.error("WebSocket Error:", error);
  }

  function handleIncomingMessage(data) {
    switch (data.type) {
      case "info":
      case "message":
        displayMessage(data);
        // Jika ada pesan masuk, berarti pengirim sudah berhenti mengetik
        if (data.senderName && currentlyTyping[data.senderName]) {
          clearTimeout(currentlyTyping[data.senderName]);
          delete currentlyTyping[data.senderName];
          updateTypingIndicator();
        }
        break;
      case "user_typing":
        // Jika user lain mulai mengetik
        if (currentlyTyping[data.userName]) {
          clearTimeout(currentlyTyping[data.userName]);
        }
        currentlyTyping[data.userName] = setTimeout(() => {
          delete currentlyTyping[data.userName];
          updateTypingIndicator();
        }, 3000); // Indikator hilang setelah 3 detik
        updateTypingIndicator();
        break;
      case "user_stopped_typing":
        // Jika user lain berhenti mengetik
        if (currentlyTyping[data.userName]) {
          clearTimeout(currentlyTyping[data.userName]);
          delete currentlyTyping[data.userName];
          updateTypingIndicator();
        }
        break;
    }
  }

  function displayMessage(data) {
    const msgContainer = document.createElement("div");
    if (data.type === "info") {
      msgContainer.className = "text-center text-sm text-slate-500 italic my-2";
      msgContainer.textContent = data.message;
    } else if (data.type === "message") {
      const colorClass = getUserColor(data.senderName);
      msgContainer.className = "flex flex-col items-start gap-1";
      msgContainer.innerHTML = `
                <p class="text-xs font-bold ${colorClass}">${data.senderName}</p>
                <div class="max-w-xs md:max-w-md p-3 rounded-2xl bg-slate-200 text-slate-800 rounded-tl-lg break-words">
                    ${data.message}
                </div>
            `;
    }
    chatMessages.appendChild(msgContainer);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function displaySelfMessage(message) {
    const msgContainer = document.createElement("div");
    msgContainer.className = "flex flex-col items-end gap-1";
    msgContainer.innerHTML = `
            <div class="max-w-xs md:max-w-md p-3 rounded-2xl bg-indigo-600 text-white rounded-br-lg break-words">
                ${message}
            </div>
        `;
    chatMessages.appendChild(msgContainer);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // --- FITUR BARU: Fungsi untuk update teks indikator ---
  function updateTypingIndicator() {
    const typingUsers = Object.keys(currentlyTyping);
    if (typingUsers.length === 0) {
      typingIndicator.textContent = "";
    } else if (typingUsers.length === 1) {
      typingIndicator.textContent = `${typingUsers[0]} is typing...`;
    } else if (typingUsers.length === 2) {
      typingIndicator.textContent = `${typingUsers.join(
        " and "
      )} are typing...`;
    } else {
      typingIndicator.textContent = "Several people are typing...";
    }
  }

  // --- Event Listeners ---

  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    userName = nameInput.value.trim();
    if (userName) showScreen(menuScreen);
  });

  joinPublicBtn.addEventListener("click", () =>
    connectWebSocket("public-chat-room")
  );

  createPrivateBtn.addEventListener("click", () => {
    const newRoomId = Math.random().toString(36).substring(2, 10).toUpperCase();
    navigator.clipboard
      .writeText(newRoomId)
      .then(() => showToast(`Kode Ruangan: ${newRoomId} (telah disalin)`))
      .catch(() => alert(`Kode Ruangan Anda: ${newRoomId}`));
    connectWebSocket(newRoomId);
  });

  joinPrivateForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const code = privateCodeInput.value.trim();
    if (code) connectWebSocket(code);
  });

  messageForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const message = messageInput.value.trim();
    if (message && socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: "message", message }));
      socket.send(JSON.stringify({ type: "typing_stop" })); // Berhenti mengetik saat kirim
      clearTimeout(typingTimer);
      displaySelfMessage(message);
      messageInput.value = "";
    }
  });

  exitBtn.addEventListener("click", () => {
    if (socket) socket.close();
    chatMessages.innerHTML = "";
    typingIndicator.textContent = "";
    Object.keys(currentlyTyping).forEach((key) => delete currentlyTyping[key]); // Reset state
    showScreen(menuScreen);
  });

  // --- FITUR BARU: Event listener untuk input pesan ---
  messageInput.addEventListener("input", () => {
    if (socket?.readyState === WebSocket.OPEN) {
      clearTimeout(typingTimer);
      socket.send(JSON.stringify({ type: "typing_start" }));
      typingTimer = setTimeout(() => {
        socket.send(JSON.stringify({ type: "typing_stop" }));
      }, typingTimeout);
    }
  });

  showScreen(loginScreen);
});
