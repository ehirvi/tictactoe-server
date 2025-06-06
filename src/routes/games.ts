import express, { Request, Response } from "express";
import { v4 as uuid } from "uuid";
import { GameSession, PlayerToken } from "../utils/types";
import gameSessions from "../data/gameSessions";
import { signToken } from "../utils/token";

const router = express.Router();

router.use(express.json());

router.post("/create", (_req: Request, res: Response) => {
  const gameId = uuid();
  const newSession: GameSession = {
    id: gameId,
    players: [],
    game_board: [null, null, null, null, null, null, null, null, null],
    turn: "Host",
  };
  gameSessions[gameId] = newSession;

  const playerToken: PlayerToken = {
    player_id: uuid(),
    game_id: gameId,
    role: "Host",
  };
  const signedPlayerToken = signToken(playerToken);

  res.status(201).json({
    token: signedPlayerToken,
    game_id: gameId,
    role: playerToken.role,
  });
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
      if (gameSession.players.length === 2) {
        res.status(400).json({ error: "Game already has 2 players" });
        return;
      }
      const playerToken: PlayerToken = {
        player_id: uuid(),
        game_id: gameId,
        role: "Guest",
      };
      const signedPlayerToken = signToken(playerToken);

      res.status(200).json({
        token: signedPlayerToken,
        role: playerToken.role,
      });
    } catch {
      res.status(400).json({ error: "Valid ID was not provided" });
    }
  }
);

export default router;
