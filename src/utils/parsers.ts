import { playerMovementSchema } from "./schemas";

export const parseGameAction = (object: unknown) => {
  // Change this to union eventually
  const parsedAction = playerMovementSchema.parse(object);
  if (parsedAction.type === "PlayerMovement") {
    return parsedAction;
  }
  return;
};
