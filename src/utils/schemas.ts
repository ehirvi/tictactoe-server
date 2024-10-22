import { z } from "zod";

const playerRoleSchema = z.union([z.literal("Host"), z.literal("Guest")]);

// const playerMarkSchema = z.union([z.literal("X"), z.literal("O"), z.null()])

export const playerMovementSchema = z.object({
  type: z.string(),
  player: z.object({
    id: z.string(),
    role: playerRoleSchema,
  }),
  position: z.number(),
});

// Add schemas to this union
// export const gameActionSchema = z.union([playerMovementSchema]);
