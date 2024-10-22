import { WebSocket } from "ws";

type PlayerRole = "Host" | "Guest";

type PlayerMark = "X" | "O"

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

export interface PlayerMovement {
  type: "PlayerMovement";
  player: {
    id: string;
    role: PlayerRole;
  };
  position: number;
}

// Add all game actions into this union
export type GameAction = PlayerMovement;
