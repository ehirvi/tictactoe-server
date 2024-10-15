import { z } from "zod";

export const playerMovementSchema = z.object({
  type: z.string(),
  player: z.object({
    id: z.string(),
    host: z.boolean(),
  }),
  game_board: z.array(z.string().or(z.null())).length(9),
  index: z.number(),
});

// Add schemas to this union
// export const gameActionSchema = z.union([playerMovementSchema]);
