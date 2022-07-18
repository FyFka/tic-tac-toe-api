import { WebSocketServer } from "ws";
import { IActiveGameRoom, IGameRoom } from "./interfaces/IRoom";

export const wss = new WebSocketServer({ port: 8080 });
export const rooms: IGameRoom[] = [];
export const activeRooms: { [key: string]: IActiveGameRoom } = {};
