import WebSocket from "ws";
import { GameSymbol } from "./IGameSymbol";

export interface IRoom {
  name: string;
  size: number;
  password?: string;
}

export interface IGameRoom extends IRoom {
  id: string;
  players: Map<WebSocket, GameSymbol>;
}

export interface IActiveGameRoom extends IGameRoom {
  board: string[][];
  isfirstPlayerTurn: boolean;
  turn: number;
}
