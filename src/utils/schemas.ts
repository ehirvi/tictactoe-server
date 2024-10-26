import { z } from "zod";

const playerRoleSchema = z.union([z.literal("Host"), z.literal("Guest")]);

export const playerMoveSchema = z.object({
  type: z.literal("PlayerMove"),
  game_id: z.string(),
  player: z.object({
    id: z.string(),
    role: playerRoleSchema,
  }),
  position: z.number(),
});

// Add schemas to this union
// export const serverEventSchema = z.union([playerMoveSchema, ...]);
