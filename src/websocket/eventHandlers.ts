import { RawData, WebSocket } from "ws";
import { IncomingMessage } from "http";
import { v4 as uuid } from "uuid";
import { parseGameEvent } from "../utils/parsers";
import gameSessions from "../data/gameSessions";
import { Player, PlayerJoinEvent, PlayerMoveEvent } from "../utils/types";

const onConnection = (socket: WebSocket, request: IncomingMessage) => {
  if (request.url) {
    const sessionId = request.url.slice(1);
    const gameSession = gameSessions[sessionId];
    if (Object.keys(gameSession.players).length > 1) {
      socket.send("The game already has 2 players");
      socket.close();
      return;
    }
    const playerRole =
      Object.keys(gameSession.players).length === 0 ? "Host" : "Guest";

    const player: Player = {
      id: uuid(),
      connection: socket,
      role: playerRole,
    };
    gameSessions[sessionId].players[player.id] = player;
    const playerJoined: PlayerJoinEvent = {
      type: "PlayerJoin",
      player_id: player.id,
    };
    const gameBoardEvent = {
      type: "GameBoard",
      game_board: gameSession.game_board,
    };
    socket.send(JSON.stringify(playerJoined));
    socket.send(JSON.stringify(gameBoardEvent));
  }
};

const onMessage = (socket: WebSocket, data: RawData) => {
  if (data instanceof Buffer) {
    try {
      const object: unknown = JSON.parse(data.toString());
      const gameEvent = parseGameEvent(object);
      if (gameEvent) {
        switch (gameEvent.type) {
          case "PlayerMove":
            movePlayer(gameEvent);
            break;
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error(err);
        socket.send("Forbidden request");
      }
    }
  }
};

const movePlayer = (playerMove: PlayerMoveEvent) => {
  const sessionId = playerMove.game_id;
  const gameSession = gameSessions[sessionId];
  console.log(gameSessions);
  if (gameSession.game_board[playerMove.position] === null) {
    gameSessions[sessionId].game_board[playerMove.position] =
      gameSession.players[playerMove.player.id].role === "Host" ? "X" : "O";
  }
  // TODO: create type for gameBoardEvent
  const gameBoardEvent = {
    type: "GameBoard",
    game_board: gameSession.game_board,
  };
  Object.values(gameSession.players).forEach((player) => {
    player.connection.send(JSON.stringify(gameBoardEvent));
  });
};

export default { onConnection, onMessage };
