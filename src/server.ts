import WebSocket, { WebSocketServer } from "ws";
import { IMessage, IRoom, IGameRoom, SocketEvents } from "./interfaces/IRoom";
import { v4 } from "uuid";
import { handlerCreateRoom, handlerGetRooms } from "./handlers";

export const wss = new WebSocketServer({ port: 8080 });
export const rooms: IGameRoom[] = [];

const eventDistributor = (ws: WebSocket.WebSocket, clientMessage: IMessage<unknown>) => {
  switch (clientMessage.event) {
    case SocketEvents.GET_ROOMS:
      handlerGetRooms(ws);
      break;
    case SocketEvents.CREATE_ROOM:
      handlerCreateRoom(ws, clientMessage.data as Partial<IRoom>);
      break;
    default:
      ws.send(JSON.stringify({ event: SocketEvents.INCORRECT_EVENT, data: "Incorrect event" }));
      break;
  }
};

wss.on("connection", (ws) => {
  ws.id = v4();
  ws.on("message", (message) => {
    const clientMessage = JSON.parse(message.toString()) as IMessage<unknown>;
    eventDistributor(ws, clientMessage);
  });
});
