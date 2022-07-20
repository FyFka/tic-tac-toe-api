import WebSocket from "ws";
import { wss } from "./constants";
import { IMessage } from "./interfaces/IMessage";

export const sendToAllClients = <T>(message: IMessage<T>) => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
};

export const sendToClient = <T>(ws: WebSocket, message: IMessage<T>) => {
  ws.send(JSON.stringify(message));
};
