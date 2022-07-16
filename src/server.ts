import WebSocket from "ws";
import { IMessage, IRoom, SocketEvents } from "./interfaces/IRoom";
import { v4 } from "uuid";
import { handleCreateRoom, handleGetRooms, handleJoinRoom } from "./handlers";
import { wss } from "./constants";
import { sendToClient } from "./sender";

const eventDistributor = (ws: WebSocket.WebSocket, clientMessage: IMessage<unknown>) => {
  switch (clientMessage.event) {
    case SocketEvents.GET_ROOMS:
      handleGetRooms(ws);
      break;
    case SocketEvents.CREATE_ROOM:
      handleCreateRoom(ws, clientMessage.data as Partial<IRoom>);
      break;
    case SocketEvents.JOIN_ROOM:
      handleJoinRoom(ws, clientMessage.data as { id: string; password?: string });
      break;
    default:
      sendToClient(ws, { event: SocketEvents.UNKNOWN_EVENT, data: { info: "Unknown event" } });
      break;
  }
};

wss.on("connection", (ws) => {
  ws.id = v4();
  ws.on("message", (message) => {
    try {
      const clientMessage = JSON.parse(message.toString()) as IMessage<unknown>;
      eventDistributor(ws, clientMessage);
    } catch (err) {
      sendToClient(ws, { event: SocketEvents.UNKNOWN_EVENT, data: { info: "Unknown event" } });
    }
  });
});
