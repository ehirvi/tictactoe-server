import gameSessions from "../data/gameSessions";
import {
  GameBoardUpdateEvent,
  GameStatusEvent,
  GameSession,
  Player,
  PlayerMark,
  PlayerMoveEvent,
} from "../utils/types";
import { hasWinningRow, isBoardFull, winningRows } from "./helpers";

const movePlayer = (playerMoveEvent: PlayerMoveEvent) => {
  const sessionId = playerMoveEvent.game_id;
  const gameSession = gameSessions[sessionId];
  console.log(gameSessions);
  if (gameSession.game_board[playerMoveEvent.position] === null) {
    const player = gameSession.players[playerMoveEvent.player.id];
    const playerRole = player.role;
    const playerMark = playerRole === "Host" ? "X" : "O";
    gameSession.game_board[playerMoveEvent.position] = playerMark;
    gameSession.turn = playerRole === "Host" ? "Guest" : "Host";
    const gameBoardUpdateEvent: GameBoardUpdateEvent = {
      type: "GameBoardUpdate",
      game_board: gameSession.game_board,
      turn: gameSession.turn,
    };
    Object.values(gameSession.players).forEach((player) => {
      player.connection.send(JSON.stringify(gameBoardUpdateEvent));
      const gameStatusEvent: GameStatusEvent = {
        type: "GameStatus",
        message:
          player.role === gameBoardUpdateEvent.turn
            ? "Your turn!"
            : "Opponent's turn!",
      };
      player.connection.send(JSON.stringify(gameStatusEvent));
    });
    checkGameConditions(gameSession, player.id, playerMark);
  }
};

const checkGameConditions = (
  gameSession: GameSession,
  playerId: Player["id"],
  playerMark: PlayerMark
) => {
  let playerWon = false;
  for (const row of winningRows) {
    if (!hasWinningRow(gameSession.game_board, row, playerMark)) {
      continue;
    }
    playerWon = true;
    break;
  }
  if (playerWon) {
    gameSession.on_going = false;
    Object.values(gameSession.players).forEach((player) => {
      const gameStatusEvent: GameStatusEvent = {
        type: "GameStatus",
        message: player.id === playerId ? "You have won!" : "You have lost!",
      };
      player.connection.send(JSON.stringify(gameStatusEvent));
      player.connection.close();
    });
    delete gameSessions[gameSession.id];
  } else if (isBoardFull(gameSession.game_board)) {
    gameSession.on_going = false;
    const gameStatusEvent: GameStatusEvent = {
      type: "GameStatus",
      message: "It's a draw!",
    };
    Object.values(gameSession.players).forEach((player) => {
      player.connection.send(JSON.stringify(gameStatusEvent));
      player.connection.close();
    });
    delete gameSessions[gameSession.id];
  }
};

export default { movePlayer };
