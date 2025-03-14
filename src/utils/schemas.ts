import { z } from "zod";

export const playerTokenSchema = z.object({
  player_id: z.string(),
  game_id: z.string(),
  role: z.literal("Host").or(z.literal("Guest")),
});

export const playerMoveSchema = z.object({
  type: z.literal("PlayerMove"),
  position: z.number(),
});

// Add schemas to this union
// export const serverEventSchema = z.union([playerMoveSchema, ...]);
