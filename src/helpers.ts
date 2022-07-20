import { GameSymbol } from "./interfaces/IGameSymbol";
import { IActiveGameRoom, IGameRoom } from "./interfaces/IRoom";
import WebSocket from "ws";
import { GameResult } from "./interfaces/IGameResult";
import { gameRooms } from "./constants";

export const toActiveGameRoom = (room: IGameRoom): IActiveGameRoom => {
  const isfirstPlayerTurn = Math.random() > 0.5;
  const iterator = room.players.keys();
  const firstPlayer = iterator.next().value;
  const secondPlayer = iterator.next().value;

  return {
    ...room,
    players: new Map([
      [firstPlayer, isfirstPlayerTurn ? GameSymbol.X : GameSymbol.O],
      [secondPlayer, isfirstPlayerTurn ? GameSymbol.O : GameSymbol.X],
    ]),
    turn: 0,
    isfirstPlayerTurn,
    board: new Array(room.size).fill(new Array(room.size).fill("")).map((a) => a.slice()),
  };
};

export const getCurrentTurn = (room: IActiveGameRoom): { currentTurn: WebSocket; nextTurn: WebSocket } => {
  const iterator = room.players.keys();
  const firstPlayer = iterator.next().value;
  const secondPlayer = iterator.next().value;
  return {
    currentTurn: room.isfirstPlayerTurn ? firstPlayer : secondPlayer,
    nextTurn: room.isfirstPlayerTurn ? secondPlayer : firstPlayer,
  };
};

export const checkWin = (gameRoom: IActiveGameRoom, row: number, cell: number, gameSymbol: GameSymbol) => {
  if (gameRoom.board[row].every((cell) => cell === gameSymbol)) {
    return gameSymbol === GameSymbol.X ? GameResult.X_WON : GameResult.O_WON;
  } else if (gameRoom.board.every((row) => row[cell] === gameSymbol)) {
    return gameSymbol === GameSymbol.X ? GameResult.X_WON : GameResult.O_WON;
  }
  const diagonal1 = gameRoom.board.map((row, i) => row[i]);
  if (diagonal1.every((cell) => cell === gameSymbol)) {
    return gameSymbol === GameSymbol.X ? GameResult.X_WON : GameResult.O_WON;
  }
  const diagonal2 = gameRoom.board.map((row, i) => row[row.length - i - 1]);
  if (diagonal2.every((cell) => cell === gameSymbol)) {
    return gameSymbol === GameSymbol.X ? GameResult.X_WON : GameResult.O_WON;
  }
  if (gameRoom.turn === gameRoom.size * gameRoom.size) {
    return GameResult.DRAW;
  }
  return GameResult.IN_PROGRESS;
};

export const removeGameRoom = (roomId: string) => {
  delete gameRooms[roomId];
};
