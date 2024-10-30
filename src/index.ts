import express from "express";
import cors from "cors";
import { WebSocketServer } from "ws";
import gamesRouter from "./routes/games";
import eventHandlers from "./websocket/eventHandlers";

const app = express();
const PORT = 3000;
app.use(cors());

app.get("/ping", (_req, res) => {
  res.send("pong");
});

app.use("/api/games", gamesRouter);

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});

const wss = new WebSocketServer({ server });

wss.on("connection", (socket, request) => {
  eventHandlers.onConnection(socket, request);

  socket.on("message", (data) => {
    eventHandlers.onMessage(socket, data);
  });
});
