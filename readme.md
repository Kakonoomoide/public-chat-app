# 🗨️ Public Chat App (WebSocket + Express.js)

A simple real-time public chat application built with **Node.js**, **Express.js**, **WebSocket (`ws`)**, and **Tailwind CSS**. Users can join the chat with a name, send messages, and see live messages from others — each user gets a unique color, and your own messages appear on the right.

---

## ✨ Features

- 🧑 Set your name to join the public chat
- 💬 Real-time chat using WebSocket
- 🎨 Unique color for each username
- 📱 Responsive design with Tailwind CSS
- 🪄 Your messages appear on the right, others on the left
- ⚡ Lightweight and simple to run
- 💬 Private Chat

---

## 🚀 Getting Started

### 1. Clone this repository

```bash
git clone https://github.com/kakonoomoidee/public-chat-app.git
cd public-chat-app
```

### 2. Install dependencies

```bash
npm install

```

### 3. Run the server

```bash
node server.js

```

Server will start at: `http://localhost:3000`

# 📱 Access from Mobile

To access from your phone:

1. Make sure your phone and PC are on the same Wi-Fi network.
2. Find your local IP (e.g. 192.168.1.10).
3. Open browser on your phone and go to:

> http://192.168.1.10:3000

# 🛠 Project Structure

```bash
.
├── public/                # Frontend with Tailwind & WebSocket client
│   └── index.html
├── server.js              # Express.js + WebSocket backend
├── package.json
└── README.md

```

# 📦 Dependencies

- express
- ws
- tailwindcss (via CDN)

# 📸 Screenshot

🧩 Future Improvements (Optional)

1. Chat history
2. Emoji support
3. Persistent user sessions (with localStorage or database)

# 📄 License

MIT License — feel free to use and modify.
