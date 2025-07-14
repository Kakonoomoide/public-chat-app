const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static("public"));

// Simpan nama user per koneksi
const clients = new Map();

wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.on("message", (data) => {
    const parsed = JSON.parse(data);

    // Jika user baru, simpan nama mereka
    if (parsed.type === "setName") {
      clients.set(ws, parsed.name);
      ws.send(
        JSON.stringify({ type: "info", message: `Welcome ${parsed.name}!` })
      );
      broadcast(`${parsed.name} joined the chat.`, ws);
    }

    // Jika kirim pesan
    else if (parsed.type === "chat") {
      const name = clients.get(ws);
      const message = `${name}: ${parsed.message}`;
      broadcast(message);
    }
  });

  ws.on("close", () => {
    const name = clients.get(ws);
    clients.delete(ws);
    broadcast(`${name} left the chat.`);
  });
});

// Kirim pesan ke semua client
function broadcast(message, except) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN && client !== except) {
      client.send(JSON.stringify({ type: "chat", message }));
    }
  });
}

server.listen(3000, '0.0.0.0', () => {
  console.log("Server listening on http://localhost:3000");
});
