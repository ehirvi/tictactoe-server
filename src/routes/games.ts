import express, { Request, Response } from "express";
import { v4 as uuid } from "uuid";
import { GameSession } from "../utils/types";
import gameSessions from "../data/gameSessions";

const router = express.Router();

router.use(express.json());

router.post("/create", (_req: Request, res: Response) => {
  const id = uuid();
  const newSession: GameSession = {
    id,
    players: {},
    game_board: [null, null, null, null, null, null, null, null, null],
    turn: "Host",
    on_going: true,
  };
  gameSessions[id] = newSession;
  res.status(201).json({ id });
});

router.post(
  "/join",
  (req: Request<unknown, unknown, { id: string }>, res: Response) => {
    try {
      const gameId: string = req.body.id;
      const gameSession = gameSessions[gameId];
      if (!gameSession) {
        res.status(404).json({ error: "No matching game was found" });
        return;
      }
      if (Object.keys(gameSession.players).length > 1) {
        res.status(400).json({ error: "Game already has 2 players" });
        return;
      }
      res.status(200).json({ successful: true });
    } catch (error: unknown) {
      console.error(error);
      res.status(400).json({ error: "Game ID was not specified" });
    }
  }
);

export default router;
