import express from "express";
import cors from "cors";
import { WebSocketServer } from "ws";
import gamesRouter from "./routes/games";
import eventHandlers from "./websocket/eventHandlers";
import { PlayerConnection } from "./utils/types";

const app = express();
const PORT = 3000;
app.use(
  cors({
    origin: [
      "https://tictactoe-web.fly.dev",
      "http://localhost:5173",
      "http://localhost:3003",
    ],
  })
);

app.get("/ping", (_req, res) => {
  res.send("pong");
});

app.use("/api/games", gamesRouter);

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const wss = new WebSocketServer({ server });

wss.on("connection", (socket: PlayerConnection, request) => {
  eventHandlers.onConnection(socket, request);

  socket.on("message", (data) => {
    eventHandlers.onMessage(socket, data);
  });

  socket.on("close", () => {
    eventHandlers.onClose(socket);
  });
});
