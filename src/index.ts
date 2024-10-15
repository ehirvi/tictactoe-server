import express from "express";
import { WebSocketServer } from "ws";
import { parseGameAction } from "./utils/parsers";

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

  ws.on("message", (data) => {
    if (data instanceof Buffer) {
      try {
        const gameState: unknown = JSON.parse(data.toString());
        const playerMovement = parseGameAction(gameState);
        if (playerMovement) {
          console.log(playerMovement);
          const updatedBoard = playerMovement.game_board;
          if (updatedBoard[playerMovement.index] === null) {
            updatedBoard[playerMovement.index] = playerMovement.player.host
              ? "X"
              : "O";
          }
          ws.send(JSON.stringify(updatedBoard));
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          console.error(err);
          ws.send("Error: message is of incorrect type");
        }
      }
    }
  });
});
