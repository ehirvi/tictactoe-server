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
  on_going: boolean;
}

export type GameSessionMap = Record<string, GameSession>;

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

// Events received and handled by the server
export interface PlayerMoveEvent {
  type: "PlayerMove";
  position: number;
}

// TODO: Add all events that are handled in the server into this union
// export type ServerEvent = PlayerMoveEvent;
