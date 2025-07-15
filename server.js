const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const path = require("path");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.render("chat");
});

const rooms = new Map();

function broadcastToRoom(roomId, message, sender) {
  const room = rooms.get(roomId);
  if (room) {
    room.forEach((client) => {
      if (client !== sender && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }
}

wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.on("message", (rawMessage) => {
    try {
      const data = JSON.parse(rawMessage);

      switch (data.type) {
        case "join": {
          const { roomId, userName } = data;
          ws.roomId = roomId;
          ws.userName = userName;

          if (!rooms.has(roomId)) {
            rooms.set(roomId, new Set());
          }
          rooms.get(roomId).add(ws);

          console.log(`User '${userName}' joined room '${roomId}'`);
          ws.send(
            JSON.stringify({
              type: "info",
              message: `Anda telah bergabung di room: ${roomId}`,
            })
          );
          broadcastToRoom(
            roomId,
            { type: "info", message: `${userName} telah bergabung.` },
            ws
          );
          break;
        }
        case "message": {
          if (ws.roomId && ws.userName) {
            broadcastToRoom(
              ws.roomId,
              {
                type: "message",
                senderName: ws.userName,
                message: data.message,
              },
              ws
            );
          }
          break;
        }
        // LOGIKA BARU: Menangani event saat pengguna mulai mengetik
        case "typing_start": {
          if (ws.roomId && ws.userName) {
            broadcastToRoom(
              ws.roomId,
              { type: "user_typing", userName: ws.userName },
              ws
            );
          }
          break;
        }
        // LOGIKA BARU: Menangani event saat pengguna berhenti mengetik
        case "typing_stop": {
          if (ws.roomId && ws.userName) {
            broadcastToRoom(
              ws.roomId,
              { type: "user_stopped_typing", userName: ws.userName },
              ws
            );
          }
          break;
        }
      }
    } catch (error) {
      console.error("Failed to handle message:", error);
    }
  });

  ws.on("close", () => {
    const { roomId, userName } = ws;
    if (roomId && rooms.has(roomId)) {
      console.log(`Client '${userName}' disconnected from room '${roomId}'`);

      const room = rooms.get(roomId);
      room.delete(ws);

      // Beri tahu pengguna lain bahwa user ini offline DAN berhenti mengetik
      broadcastToRoom(
        roomId,
        { type: "info", message: `${userName} telah keluar.` },
        ws
      );
      broadcastToRoom(
        roomId,
        { type: "user_stopped_typing", userName: userName },
        ws
      );

      if (room.size === 0 && roomId !== "public-chat-room") {
        rooms.delete(roomId);
        console.log(`Room '${roomId}' was empty and has been deleted.`);
      }
    }
  });
});

server.listen(3000, "0.0.0.0", () => {
  console.log("Server listening on http://localhost:3000");
});
