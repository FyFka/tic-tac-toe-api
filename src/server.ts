import WebSocket from "ws";
import { IRoom } from "./interfaces/IRoom";
import { handleCanPlay, handleCreateRoom, handleGetRooms, handleJoinRoom, handlePing, handleTurn } from "./handlers";
import { wss } from "./constants";
import { sendToClient } from "./sender";
import { IMessage, SocketEvents } from "./interfaces/IMessage";

const eventDistributor = (ws: WebSocket, clientMessage: IMessage<unknown>) => {
  switch (clientMessage.event) {
    case SocketEvents.PING:
      handlePing(ws);
      break;
    case SocketEvents.GET_ROOMS:
      handleGetRooms(ws);
      break;
    case SocketEvents.CREATE_ROOM:
      handleCreateRoom(ws, clientMessage.data as Partial<IRoom>);
      break;
    case SocketEvents.JOIN_ROOM:
      handleJoinRoom(ws, clientMessage.data as { id: string; password?: string });
      break;
    case SocketEvents.CAN_PLAY:
      handleCanPlay(ws, clientMessage.data as { id: string });
      break;
    case SocketEvents.PICK:
      handleTurn(ws, clientMessage.data as { id: string; row: number; cell: number });
      break;
    default:
      sendToClient(ws, { event: SocketEvents.UNKNOWN_EVENT, data: { info: `Unknown event: ${clientMessage.event}` } });
      break;
  }
};

wss.on("connection", (ws) => {
  ws.on("message", (message) => {
    try {
      const clientMessage = JSON.parse(message.toString()) as IMessage<unknown>;
      eventDistributor(ws, clientMessage);
    } catch (err) {
      sendToClient(ws, { event: SocketEvents.UNKNOWN_EVENT, data: { info: "Unknown event" } });
    }
  });
});
