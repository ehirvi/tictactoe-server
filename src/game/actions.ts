import gameSessions from "../data/gameSessions";
import { GameSession, PlayerMoveEvent, PlayerConnection } from "../utils/types";
import {
  disconnectPlayers,
  updateGameBoard,
  updateGameStatus,
} from "../websocket/serverEvents";
import { hasPlayerWon, isDraw, isSpotEmpty } from "./helpers";

export const findGameSession = (gameId: string) => {
  const gameSession = gameSessions[gameId];
  return gameSession;
};

export const endGameSession = (gameId: string) => {
  delete gameSessions[gameId];
};

export const addPlayerToGame = (
  gameSession: GameSession,
  socket: PlayerConnection
) => {
  gameSession.players = gameSession.players.concat(socket);
};

export const removePlayerFromGame = (
  gameSession: GameSession,
  socket: PlayerConnection
) => {
  gameSession.players = gameSession.players.filter(
    (player) => player.playerId !== socket.playerId
  );
};

const setPlayerMark = (
  gameSession: GameSession,
  player: PlayerConnection,
  position: number
) => {
  const playerMark = player.playerRole === "Host" ? "X" : "O";
  gameSession.game_board[position] = playerMark;
};

const changeGameTurn = (gameSession: GameSession) => {
  gameSession.turn = gameSession.turn === "Host" ? "Guest" : "Host";
};

export const movePlayer = (
  socket: PlayerConnection,
  playerMoveEvent: PlayerMoveEvent
) => {
  const gameId = socket.gameId;
  const gameSession = findGameSession(gameId);
  if (isSpotEmpty(gameSession.game_board, playerMoveEvent.position)) {
    setPlayerMark(gameSession, socket, playerMoveEvent.position);
    changeGameTurn(gameSession);
    updateGameBoard(gameSession, gameSession.players);

    if (hasPlayerWon(gameSession.game_board, socket)) {
      gameSession.players.forEach((player) => {
        const message =
          player.playerId === socket.playerId
            ? "You have won!"
            : "You have lost!";
        updateGameStatus(message, player);
      });
      disconnectPlayers(gameSession.players);
      endGameSession(gameSession.id);
      return;
    }

    if (isDraw(gameSession.game_board)) {
      const message = "It's a draw!";
      gameSession.players.forEach((player) => {
        updateGameStatus(message, player);
      });
      disconnectPlayers(gameSession.players);
      endGameSession(gameSession.id);
      return;
    }

    gameSession.players.forEach((player) => {
      const message =
        player.playerRole === gameSession.turn
          ? "Your turn!"
          : "Opponent's turn!";
      updateGameStatus(message, player);
    });
  }
};
