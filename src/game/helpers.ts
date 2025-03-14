import { GameBoard, PlayerConnection, PlayerMark } from "../utils/types";

export const winningRows = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

export const hasWinningRow = (
  gameBoard: GameBoard,
  row: number[],
  mark: PlayerMark
) => {
  if (
    gameBoard[row[0]] === mark &&
    gameBoard[row[1]] === mark &&
    gameBoard[row[2]] === mark
  ) {
    return true;
  }
  return false;
};

export const isSpotEmpty = (gameBoard: GameBoard, position: number) => {
  return gameBoard[position] === null ? true : false;
};

export const isDraw = (gameBoard: GameBoard) => {
  for (const i of gameBoard) {
    if (i === null) {
      return false;
    }
  }
  return true;
};

export const hasPlayerWon = (
  gameBoard: GameBoard,
  player: PlayerConnection
) => {
  let hasWon = false;
  const playerMark = player.playerRole === "Host" ? "X" : "O";
  for (const row of winningRows) {
    if (!hasWinningRow(gameBoard, row, playerMark)) {
      continue;
    }
    hasWon = true;
    break;
  }
  return hasWon;
};
