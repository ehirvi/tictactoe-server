import gameSessions from "../data/gameSessions";
import {
  GameBoardUpdateEvent,
  GameStatusEvent,
  GameSession,
  PlayerMark,
  PlayerMoveEvent,
  PlayerConnection,
} from "../utils/types";
import { hasWinningRow, isBoardFull, winningRows } from "./helpers";

const movePlayer = (
  socket: PlayerConnection,
  playerMoveEvent: PlayerMoveEvent
) => {
  const gameId = socket.gameId;
  const gameSession = gameSessions[gameId];
  console.log(gameSessions);
  if (gameSession.game_board[playerMoveEvent.position] === null) {
    const playerRole = socket.playerRole;
    const playerMark = playerRole === "Host" ? "X" : "O";
    gameSession.game_board[playerMoveEvent.position] = playerMark;
    gameSession.turn = playerRole === "Host" ? "Guest" : "Host";
    const gameBoardUpdateEvent: GameBoardUpdateEvent = {
      type: "GameBoardUpdate",
      game_board: gameSession.game_board,
      turn: gameSession.turn,
    };
    gameSession.players.forEach((player) => {
      player.send(JSON.stringify(gameBoardUpdateEvent));
      const gameStatusEvent: GameStatusEvent = {
        type: "GameStatus",
        message:
          player.playerRole === gameBoardUpdateEvent.turn
            ? "Your turn!"
            : "Opponent's turn!",
      };
      player.send(JSON.stringify(gameStatusEvent));
    });
    checkGameConditions(gameSession, socket.playerId, playerMark);
  }
};

const checkGameConditions = (
  gameSession: GameSession,
  playerId: PlayerConnection["playerId"],
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
    gameSession.players.forEach((player) => {
      const gameStatusEvent: GameStatusEvent = {
        type: "GameStatus",
        message: player.playerId === playerId ? "You have won!" : "You have lost!",
      };
      player.send(JSON.stringify(gameStatusEvent));
      player.close();
    });
    delete gameSessions[gameSession.id];
  } else if (isBoardFull(gameSession.game_board)) {
    gameSession.on_going = false;
    const gameStatusEvent: GameStatusEvent = {
      type: "GameStatus",
      message: "It's a draw!",
    };
    gameSession.players.forEach((player) => {
      player.send(JSON.stringify(gameStatusEvent));
      player.close();
    });
    delete gameSessions[gameSession.id];
  }
};

export default { movePlayer };
