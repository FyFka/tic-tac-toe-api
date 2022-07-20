import { WebSocketServer } from "ws";
import { IActiveGameRoom, IGameRoom } from "./interfaces/IRoom";

export const wss = new WebSocketServer({ port: Number(process.env.PORT) || 8080 });
export const rooms: IGameRoom[] = [];
export const gameRooms: { [key: string]: IActiveGameRoom } = {};
