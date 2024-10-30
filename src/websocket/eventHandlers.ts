import { RawData, WebSocket } from "ws";
import { IncomingMessage } from "http";
import { v4 as uuid } from "uuid";
import { parseGameEvent } from "../utils/parsers";
import gameSessions from "../data/gameSessions";
import {
  GameBoardUpdateEvent,
  Player,
  PlayerJoinEvent,
  PlayerMoveEvent,
} from "../utils/types";

const onConnection = (socket: WebSocket, request: IncomingMessage) => {
  if (request.url) {
    const sessionId = request.url.slice(1);
    const gameSession = gameSessions[sessionId];
    if (Object.keys(gameSession.players).length > 1) {
      socket.send("The game already has 2 players");
      socket.close();
      return;
    }
    const playerRole =
      Object.keys(gameSession.players).length === 0 ? "Host" : "Guest";

    const player: Player = {
      id: uuid(),
      connection: socket,
      role: playerRole,
    };
    gameSessions[sessionId].players[player.id] = player;
    const playerJoinEvent: PlayerJoinEvent = {
      type: "PlayerJoin",
      player_id: player.id,
      role: player.role,
    };
    const gameBoardUpdateEvent: GameBoardUpdateEvent = {
      type: "GameBoardUpdate",
      game_board: gameSession.game_board,
      turn: "Host",
    };
    socket.send(JSON.stringify(playerJoinEvent));
    socket.send(JSON.stringify(gameBoardUpdateEvent));
  }
};

const onMessage = (socket: WebSocket, data: RawData) => {
  if (data instanceof Buffer) {
    try {
      const object: unknown = JSON.parse(data.toString());
      const gameEvent = parseGameEvent(object);
      if (gameEvent) {
        switch (gameEvent.type) {
          case "PlayerMove":
            movePlayer(gameEvent);
            break;
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error(err);
        socket.send("Forbidden request");
      }
    }
  }
};

const movePlayer = (playerMoveEvent: PlayerMoveEvent) => {
  const sessionId = playerMoveEvent.game_id;
  const gameSession = gameSessions[sessionId];
  console.log(gameSessions);
  if (gameSession.game_board[playerMoveEvent.position] === null) {
    const playerRole = gameSession.players[playerMoveEvent.player.id].role;
    gameSessions[sessionId].game_board[playerMoveEvent.position] =
      playerRole === "Host" ? "X" : "O";
    gameSessions[sessionId].turn = playerRole === "Host" ? "Guest" : "Host";
    const gameBoardUpdateEvent: GameBoardUpdateEvent = {
      type: "GameBoardUpdate",
      game_board: gameSession.game_board,
      turn: gameSession.turn,
    };
    Object.values(gameSession.players).forEach((player) => {
      player.connection.send(JSON.stringify(gameBoardUpdateEvent));
    });
  }
};

export default { onConnection, onMessage };
