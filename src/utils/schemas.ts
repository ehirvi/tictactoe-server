import { z } from "zod";

const playerRoleSchema = z.union([z.literal("Host"), z.literal("Guest")]);

// const playerMarkSchema = z.union([z.literal("X"), z.literal("O")])

export const playerMoveSchema = z.object({
  type: z.string(),
  player: z.object({
    id: z.string(),
    role: playerRoleSchema,
  }),
  position: z.number(),
});

// Add schemas to this union
// export const gameEventSchema = z.union([playerMoveSchema]);
