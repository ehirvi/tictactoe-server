import { playerMoveSchema } from "./schemas";
import { PlayerMoveEvent } from "./types";

export const parseGameAction = (object: unknown) => {
  // Change this to union eventually
  const parsedAction = playerMoveSchema.parse(object);
  if (parsedAction.type === "PlayerMove") {
    return parsedAction as PlayerMoveEvent;
  }
  return;
};
