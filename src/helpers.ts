import { GameSymbol } from "./interfaces/IPlayer";
import { IActiveGameRoom, IGameRoom } from "./interfaces/IRoom";
import WebSocket from "ws";

export const toGameRoom = (room: IGameRoom): IActiveGameRoom => {
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
