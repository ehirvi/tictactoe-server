import { WebSocket } from "ws";

type PlayerMark = "X" | "O";

export type PlayerRole = "Host" | "Guest";

type GameBoard = (PlayerMark | null)[];

export interface Player {
  id: string;
  connection: WebSocket;
  role: PlayerRole;
}

export interface GameSession {
  id: string;
  players: Record<string, Player>;
  game_board: GameBoard;
  turn: PlayerRole;
}

export type GameSessionMap = Record<string, GameSession>;

// Events sent to and handled by the clients
export interface PlayerJoinEvent {
  type: "PlayerJoin";
  player_id: string;
  role: PlayerRole;
}

export interface GameBoardUpdateEvent {
  type: "GameBoardUpdate";
  game_board: GameBoard;
  turn: PlayerRole;
}

// Events received and handled by the server
export interface PlayerMoveEvent {
  type: "PlayerMove";
  game_id: string;
  player: {
    id: string;
  };
  position: number;
}

// TODO: Add all events that are handled in the server into this union
export type ServerEvent = PlayerMoveEvent;
