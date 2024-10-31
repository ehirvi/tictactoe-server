import gameSessions from "../data/gameSessions";
import {
  GameBoardUpdateEvent,
  GameSession,
  PlayerMark,
  PlayerMoveEvent,
} from "../utils/types";
import { hasWinningRow, isBoardFull, winningRows } from "./helpers";

const movePlayer = (playerMoveEvent: PlayerMoveEvent) => {
  const sessionId = playerMoveEvent.game_id;
  const gameSession = gameSessions[sessionId];
  console.log(gameSessions);
  if (gameSession.game_board[playerMoveEvent.position] === null) {
    const playerRole = gameSession.players[playerMoveEvent.player.id].role;
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
    });
    checkGameConditions(gameSession, playerMark);
  }
};

const checkGameConditions = (gameSession: GameSession, mark: PlayerMark) => {
  let playerWon = false;
  for (const row of winningRows) {
    if (!hasWinningRow(gameSession.game_board, row, mark)) {
      continue;
    }
    playerWon = true;
  }
  if (playerWon || isBoardFull(gameSession.game_board)) {
    gameSession.on_going = false;
    Object.values(gameSession.players).forEach((player) => {
      // TODO: send message to players informing them the game is over
      player.connection.close();
    });
  }
};

export default { movePlayer };
