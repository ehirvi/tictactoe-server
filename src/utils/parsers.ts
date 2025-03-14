import { JwtPayload } from "jsonwebtoken";
import { playerMoveSchema, playerTokenSchema } from "./schemas";

export const parseGameEvent = (object: unknown) => {
  const parsedEvent = playerMoveSchema.parse(object);
  return parsedEvent;
};

export const parsePlayerToken = (object: string | JwtPayload) => {
  const parsedToken = playerTokenSchema.parse(object);
  return parsedToken;
};
