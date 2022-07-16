import { WebSocketServer } from "ws";
import { IGameRoom } from "./interfaces/IRoom";

export const wss = new WebSocketServer({ port: 8080 });
export const rooms: IGameRoom[] = [];
export const activeRooms: { [key: string]: IGameRoom } = {};
