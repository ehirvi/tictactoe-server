export interface GameAction {
  player_movement: {
    player_id: string;
    game_board: (string | null)[];
    index: number;
  };
}
