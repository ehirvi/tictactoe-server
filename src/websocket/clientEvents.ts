import { RawData } from "ws";
import { IncomingMessage } from "http";
import gameSessions from "../data/gameSessions";
import { parseGameEvent } from "../utils/parsers";
import { GameSession, PlayerConnection } from "../utils/types";
import {
  addPlayerToGame,
  endGameSession,
  findGameSession,
  movePlayer,
  removePlayerFromGame,
} from "../game/actions";
import {
  disconnectPlayers,
  startGame,
  updateGameBoard,
  updateGameStatus,
} from "./serverEvents";
import { verifyToken } from "../utils/token";

export const handleConnection = (
  socket: PlayerConnection,
  request: IncomingMessage
) => {
  if (!request.url) {
    return;
  }
  try {
    const urlParam = request.url.slice(1);
    const playerToken = verifyToken(urlParam);
    const gameSession = gameSessions[playerToken.game_id];
    if (!gameSession) {
      socket.close(1011, "Game session not found");
      return;
    }
    if (gameSession.players.length === 2) {
      socket.close(1011, "Game session already has 2 players");
      return;
    }
    socket.playerId = playerToken.player_id;
    socket.gameId = playerToken.game_id;
    socket.playerRole = playerToken.role;

    addPlayerToGame(gameSession, socket);

    updateGameBoard(gameSession, [socket]);

    if (gameSession.players.length === 1) {
      updateGameStatus("Waiting for opponent to join...", socket);
    } else if (gameSession.players.length === 2) {
      startGame(gameSession.players);
      gameSession.players.forEach((player) => {
        const message =
          player.playerRole === gameSession.turn
            ? "Your turn!"
            : "Opponent's turn!";
        updateGameStatus(message, player);
      });
    }
  } catch {
    socket.close(1008, "Valid token was not provided");
  }
};

export const handleMessage = (socket: PlayerConnection, data: RawData) => {
  if (data instanceof Buffer) {
    try {
      const object: unknown = JSON.parse(data.toString());
      const gameEvent = parseGameEvent(object);
      if (gameEvent) {
        switch (gameEvent.type) {
          case "PlayerMove":
            movePlayer(socket, gameEvent);
            break;
        }
      }
    } catch {
      socket.close(1003, "Valid message type was not included");
    }
  }
};

// If player doesn't reconnect within 30 seconds, end the game
const waitForReconnection = (gameSession: GameSession) => {
  setTimeout(() => {
    if (gameSession.players.length < 2) {
      disconnectPlayers(gameSession.players);
      endGameSession(gameSession.id);
    }
  }, 30000);
};

// If a player disconnects due to broken WebSocket stream, remove them from the game session and wait for reconnection
export const handleDisconnection = (socket: PlayerConnection) => {
  if (!socket.gameId) {
    return;
  }
  const gameId = socket.gameId;
  const gameSession = findGameSession(gameId);
  if (gameSession) {
    removePlayerFromGame(gameSession, socket);
    waitForReconnection(gameSession);
  }
};
