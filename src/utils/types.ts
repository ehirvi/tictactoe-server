export interface PlayerMovement {
  type: "PlayerMovement";
  player: {
    id: string;
    host: boolean;
  };
  game_board: (string | null)[];
  index: number;
}

// Add all game actions into this union
export type GameAction = PlayerMovement;
