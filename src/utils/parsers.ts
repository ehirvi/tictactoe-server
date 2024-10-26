import { playerMoveSchema } from "./schemas";

export const parseGameEvent = (object: unknown) => {
  const parsedEvent = playerMoveSchema.parse(object);
  return parsedEvent;
};
