import config from "./config";
import { parsePlayerToken } from "./parsers";
import { PlayerToken } from "./types";
import jwt from "jsonwebtoken";
import ms from "ms";

export const signToken = (
  payload: PlayerToken,
  time: ms.StringValue = "10m"
) => {
  const token = jwt.sign(payload, config.JWT_SECRET, { expiresIn: time });
  return token;
};

export const verifyToken = (token: string) => {
  const signedToken = jwt.verify(token, config.JWT_SECRET);
  const playerToken: PlayerToken = parsePlayerToken(signedToken);
  return playerToken;
};
