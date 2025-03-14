import { RawData } from "ws";
import { IncomingMessage } from "http";
import jwt from "jsonwebtoken";
import actions from "../game/actions";
import gameSessions from "../data/gameSessions";
import { parseGameEvent, parsePlayerToken } from "../utils/parsers";
import {
  GameBoardUpdateEvent,
  GameStatusEvent,
  GameStartEvent,
  PlayerToken,
  PlayerConnection,
} from "../utils/types";
import config from "../utils/config";

const onConnection = (socket: PlayerConnection, request: IncomingMessage) => {
  if (!request.url) {
    socket.close();
    return;
  }
  try {
    const urlParam = request.url.slice(1);
    const signedPlayerToken = jwt.verify(urlParam, config.SECRET);
    const playerToken: PlayerToken = parsePlayerToken(signedPlayerToken);
    const gameSession = gameSessions[playerToken.game_id];
    if (!gameSession) {
      socket.close();
      return;
    }
    if (gameSession.players.length === 2) {
      socket.send("The game already has 2 players");
      socket.close();
      return;
    }
    socket.playerId = playerToken.player_id;
    socket.gameId = playerToken.game_id;
    socket.playerRole = playerToken.role;

    gameSession.players = gameSession.players.concat(socket);

    const gameBoardUpdateEvent: GameBoardUpdateEvent = {
      type: "GameBoardUpdate",
      game_board: gameSession.game_board,
      turn: gameSession.turn,
    };
    socket.send(JSON.stringify(gameBoardUpdateEvent));

    if (gameSession.players.length === 1) {
      const gameStatusEvent: GameStatusEvent = {
        type: "GameStatus",
        message: "Waiting for Player 2 to join...",
      };
      socket.send(JSON.stringify(gameStatusEvent));
    } else if (gameSession.players.length === 2) {
      gameSession.players.forEach((player) => {
        const gameStartEvent: GameStartEvent = {
          type: "GameStart",
          all_players_joined: true,
        };
        const gameStatusEvent: GameStatusEvent = {
          type: "GameStatus",
          message:
            player.playerRole === gameSession.turn
              ? "Your turn!"
              : "Opponent's turn!",
        };
        player.send(JSON.stringify(gameStartEvent));
        player.send(JSON.stringify(gameStatusEvent));
      });
    }
  } catch (error: unknown) {
    console.error(error);
    socket.close();
  }
};

const onMessage = (socket: PlayerConnection, data: RawData) => {
  if (data instanceof Buffer) {
    try {
      const object: unknown = JSON.parse(data.toString());
      const gameEvent = parseGameEvent(object);
      if (gameEvent) {
        switch (gameEvent.type) {
          case "PlayerMove":
            actions.movePlayer(socket, gameEvent);
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

// If a player disconnects due to unreliable WebSocket stream, remove them from the game session. If the player doesn't reconnect within 30 seconds, end the game.
const onClose = (socket: PlayerConnection) => {
  if (!socket.gameId) {
    return;
  }
  const gameId = socket.gameId;
  const gameSession = gameSessions[gameId];
  if (gameSession) {
    gameSession.players = gameSession.players.filter(
      (player) => player.playerId !== socket.playerId
    );
    setTimeout(() => {
      if (gameSession.players.length < 2) {
        gameSession.players.forEach((player) => {
          player.close();
        });
        delete gameSessions[gameId];
      }
    }, 30000);
  }
};

export default { onConnection, onMessage, onClose };
