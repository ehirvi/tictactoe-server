import { WebSocket } from "ws";

type PlayerRole = "Host" | "Guest";

type PlayerMark = "X" | "O";

type GameBoard = (PlayerMark | null)[];

export interface Player {
  id: string;
  connection: WebSocket;
  role: PlayerRole;
}

export interface GameSession {
  id: string;
  players: Player[];
  game_board: GameBoard;
}

export type GameSessionMap = Record<string, GameSession>;

export interface PlayerJoinEvent {
  type: "PlayerJoin";
  player_id: string;
}

export interface PlayerMoveEvent {
  type: "PlayerMove";
  player: {
    id: string;
    role: PlayerRole;
  };
  position: number;
}

// Add all game event into this union
export type GameEvent = PlayerMoveEvent;
