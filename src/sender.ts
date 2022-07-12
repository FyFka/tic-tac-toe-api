import WebSocket from "ws";
import { IMessage } from "./interfaces/IRoom";
import { wss } from "./server";

export const sendToAllClients = <T>(message: IMessage<T>) => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
};
