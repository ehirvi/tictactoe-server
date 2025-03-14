import {
  GameBoardUpdateEvent,
  GameSession,
  GameStartEvent,
  GameStatusEvent,
  PlayerConnection,
} from "../utils/types";

export const updateGameBoard = (
  gameSession: GameSession,
  players: PlayerConnection[]
) => {
  const gameBoardUpdateEvent: GameBoardUpdateEvent = {
    type: "GameBoardUpdate",
    game_board: gameSession.game_board,
    turn: gameSession.turn,
  };
  players.forEach((player) =>
    player.send(JSON.stringify(gameBoardUpdateEvent))
  );
};

export const updateGameStatus = (message: string, player: PlayerConnection) => {
  const gameStatusEvent: GameStatusEvent = {
    type: "GameStatus",
    message,
  };
  player.send(JSON.stringify(gameStatusEvent));
};

export const startGame = (players: PlayerConnection[]) => {
  const gameStartEvent: GameStartEvent = {
    type: "GameStart",
    all_players_joined: true,
  };
  players.forEach((player) => player.send(JSON.stringify(gameStartEvent)));
};

export const disconnectPlayers = (players: PlayerConnection[]) => {
  players.forEach((player) => player.close());
};
