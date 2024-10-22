import express from "express";
import { WebSocketServer } from "ws";
import { v4 as uuid } from "uuid";
import { parseGameAction } from "./utils/parsers";
import { GameSession, Player } from "./utils/types";
import games from "./data/games";

const app = express();
const PORT = 3000;

app.get("/ping", (_req, res) => {
  res.send("pong");
});

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const wss = new WebSocketServer({ server });

wss.on("connection", (socket) => {
  const player: Player = {
    id: uuid(),
    connection: socket,
    role: "Host",
  };
  const session: GameSession = {
    id: uuid(),
    players: [player],
    game_board: [null, null, null, null, null, null, null, null, null],
  };
  games.push(session);

  // socket.send("You are connected!");

  socket.on("message", (data) => {
    if (data instanceof Buffer) {
      try {
        const gameState: unknown = JSON.parse(data.toString());
        const playerMovement = parseGameAction(gameState);
        if (playerMovement) {
          console.log(games);
          if (session.game_board[playerMovement.position] === null) {
            session.game_board[playerMovement.position] =
              playerMovement.player.role === "Host" ? "X" : "O";
          }
          socket.send(JSON.stringify(session.game_board));
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          console.error(err);
          socket.send("Forbidden request");
        }
      }
    }
  });
});
