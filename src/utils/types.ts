import { WebSocket } from "ws";

export type PlayerMark = "X" | "O";

export type PlayerRole = "Host" | "Guest";

export type GameBoard = (PlayerMark | null)[];

export interface PlayerConnection extends WebSocket {
  playerId: string;
  gameId: string;
  playerRole: PlayerRole;
}

export interface PlayerToken {
  player_id: string;
  game_id: string;
  role: PlayerRole;
}

export interface GameSession {
  id: string;
  players: PlayerConnection[];
  game_board: GameBoard;
  turn: PlayerRole;
}

export type GameSessionMap = Record<string, GameSession>;

// Events sent by the server
export interface GameStartEvent {
  type: "GameStart";
  all_players_joined: boolean;
}

export interface GameBoardUpdateEvent {
  type: "GameBoardUpdate";
  game_board: GameBoard;
  turn: PlayerRole;
}

export interface GameStatusEvent {
  type: "GameStatus";
  message: string;
}

// Events sent by the client
export interface PlayerMoveEvent {
  type: "PlayerMove";
  position: number;
}
