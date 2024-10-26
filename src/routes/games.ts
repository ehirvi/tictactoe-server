import express from "express";
import { v4 as uuid } from "uuid";
import { GameSession } from "../utils/types";
import gameSessions from "../data/gameSessions";

const router = express.Router();

router.post("/create", (_req, res) => {
  const id = uuid();
  const newSession: GameSession = {
    id,
    players: {},
    game_board: [null, null, null, null, null, null, null, null, null],
  };
  gameSessions[id] = newSession;
  res.json({ id });
});

export default router;
