import express from "express";
import cors from "cors";
import { WebSocketServer } from "ws";
import { v4 as uuid } from "uuid";
import { parseGameAction } from "./utils/parsers";
import { GameSession, Player, PlayerJoinEvent } from "./utils/types";
import gameSessions from "./data/gameSessions";
import gamesRouter from "./routes/games";

const app = express();
const PORT = 3000;
app.use(cors());

app.get("/ping", (_req, res) => {
  res.send("pong");
});

app.use("/api/games", gamesRouter);

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
  gameSessions[session.id] = session;
  console.log("SOCKET_SERVER", gameSessions);

  const playerJoined: PlayerJoinEvent = {
    type: "PlayerJoin",
    player_id: player.id,
  };
  socket.send(JSON.stringify(playerJoined));

  socket.on("message", (data) => {
    if (data instanceof Buffer) {
      try {
        const gameState: unknown = JSON.parse(data.toString());
        const playerMovement = parseGameAction(gameState);
        if (playerMovement) {
          console.log(gameSessions);
          if (session.game_board[playerMovement.position] === null) {
            session.game_board[playerMovement.position] =
              playerMovement.player.role === "Host" ? "X" : "O";
          }
          // TODO: add this type
          const gameBoardEvent = {
            type: "GameBoard",
            game_board: session.game_board,
          };
          socket.send(JSON.stringify(gameBoardEvent));
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
