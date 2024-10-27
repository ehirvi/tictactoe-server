import { WebSocket } from "ws";

export type PlayerRole = "Host" | "Guest";

type PlayerMark = "X" | "O";

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
}

export type GameSessionMap = Record<string, GameSession>;

export interface PlayerJoinEvent {
  type: "PlayerJoin";
  player_id: string;
}

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
