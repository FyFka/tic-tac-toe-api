import WebSocket from "ws";
import { IMessage } from "./interfaces/IRoom";
import { wss } from "./constants";

export const sendToAllClients = <T>(message: IMessage<T>) => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
};

export const sendToClient = <T>(ws: WebSocket.WebSocket, message: IMessage<T>) => {
  ws.send(JSON.stringify(message));
};
