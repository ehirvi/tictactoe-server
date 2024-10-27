import { z } from "zod";

export const playerMoveSchema = z.object({
  type: z.literal("PlayerMove"),
  game_id: z.string(),
  player: z.object({
    id: z.string(),
  }),
  position: z.number(),
});

// Add schemas to this union
// export const serverEventSchema = z.union([playerMoveSchema, ...]);
