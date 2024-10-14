import express from "express";
import { WebSocketServer } from "ws";
import { GameAction } from "./utils/types";

const app = express();
const PORT = 3000;

app.get("/ping", (_req, res) => {
  res.send("pong");
});

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
  // console.log("connected!");
  // ws.send("You are connected!");

  ws.on("message", (data, isBinary) => {
    if (!isBinary) {
      const gameState: unknown = JSON.parse(data.toString());
      if (
        gameState &&
        typeof gameState === "object" &&
        "player_movement" in gameState
      ) {
        console.log(gameState as GameAction);
        const updatedBoard = (gameState as GameAction).player_movement
          .game_board;
        updatedBoard[(gameState as GameAction).player_movement.index] = "X";
        ws.send(JSON.stringify(updatedBoard));
      }
    }
  });
});
