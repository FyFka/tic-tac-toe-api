import WebSocket from "ws";
import { IRoom, SocketEvents } from "./interfaces/IRoom";
import { sendToAllClients } from "./sender";
import { rooms } from "./server";

export const handlerGetRooms = (ws: WebSocket.WebSocket) => {
  ws.send(JSON.stringify({ event: SocketEvents.GET_ROOMS, data: rooms }));
};

export const handlerCreateRoom = (ws: WebSocket.WebSocket, room: Partial<IRoom>) => {
  if (!room.name || !room.size) {
    return ws.send(
      JSON.stringify({
        event: SocketEvents.CREATE_ROOM_ERROR,
        data: { info: "Incorrect room name or size", field: "name" },
      })
    );
  }
  // if (rooms.find((r) => r.name === room.name)) {
  //   return ws.send(
  //     JSON.stringify({ event: SocketEvents.CREATE_ROOM_ERROR, data: { info: "Room already exists", field: "name" } })
  //   );
  // }
  // if (room.size < 3 || room.size > 12) {
  //   return ws.send(
  //     JSON.stringify({
  //       event: SocketEvents.CREATE_ROOM_ERROR,
  //       data: { info: "Room size cannot be less than 3 and more then 12", field: "size" },
  //     })
  //   );
  // }
  const newRoom = {
    name: room.name,
    size: room.size,
    password: room?.password,
    board: new Array(room.size).fill(new Array(room.size).fill(0)),
  };
  rooms.push(newRoom);
  sendToAllClients({ event: SocketEvents.ADD_ROOM, data: newRoom });
};
