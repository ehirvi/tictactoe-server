import { RawData, WebSocket } from "ws";
import { IncomingMessage } from "http";
import { v4 as uuid } from "uuid";
import actions from "../game/actions";
import gameSessions from "../data/gameSessions";
import { parseGameEvent } from "../utils/parsers";
import {
  GameBoardUpdateEvent,
  Player,
  PlayerJoinEvent,
  GameStatusEvent,
  GameStartEvent,
} from "../utils/types";

const onConnection = (socket: WebSocket, request: IncomingMessage) => {
  if (!request.url) {
    socket.close();
    return;
  }
  const sessionId = request.url.slice(1);
  const gameSession = gameSessions[sessionId];
  if (!gameSession) {
    socket.close();
    return;
  }

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
  gameSession.players[player.id] = player
  const playerJoinEvent: PlayerJoinEvent = {
    type: "PlayerJoin",
    player_id: player.id,
    role: player.role,
  };
  const gameBoardUpdateEvent: GameBoardUpdateEvent = {
    type: "GameBoardUpdate",
    game_board: gameSession.game_board,
    turn: gameSession.turn,
  };
  socket.send(JSON.stringify(playerJoinEvent));
  socket.send(JSON.stringify(gameBoardUpdateEvent));
  if (playerRole === "Host") {
    const gameStatusEvent: GameStatusEvent = {
      type: "GameStatus",
      message: "Waiting for Player 2 to join...",
    };
    socket.send(JSON.stringify(gameStatusEvent));
  } else {
    Object.values(gameSession.players).forEach((player) => {
      const gameStartEvent: GameStartEvent = {
        type: "GameStart",
        all_players_joined: true,
      };
      const gameStatusEvent: GameStatusEvent = {
        type: "GameStatus",
        message: player.role === "Host" ? "Your turn!" : "Opponent's turn!",
      };
      player.connection.send(JSON.stringify(gameStartEvent));
      player.connection.send(JSON.stringify(gameStatusEvent));
    });
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
            actions.movePlayer(gameEvent);
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

const onClose = (request: IncomingMessage) => {
  if (!request.url) {
    return;
  }
  const sessionId = request.url.slice(1);
  const gameSession = gameSessions[sessionId];
  if (gameSession) {
    Object.values(gameSession.players).forEach((player) => {
      player.connection.close();
    });
    delete gameSessions[sessionId];
  }
};

export default { onConnection, onMessage, onClose };
