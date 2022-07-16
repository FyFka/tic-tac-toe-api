import { v4 } from "uuid";
import WebSocket from "ws";
import { activeRooms, rooms } from "./constants";
import { IRoom, SocketEvents } from "./interfaces/IRoom";
import { sendToAllClients, sendToClient } from "./sender";

export const handleGetRooms = (ws: WebSocket.WebSocket) => {
  sendToClient(ws, {
    event: SocketEvents.GET_ROOMS,
    data: rooms.map(({ id, name, size, password }) => ({ id, name, size, password: password ? true : false })),
  });
};

export const handleCreateRoom = (ws: WebSocket.WebSocket, room: Partial<IRoom>) => {
  if (!room.name || !room.size) {
    return sendToClient(ws, {
      event: SocketEvents.CREATE_ROOM_ERROR,
      data: { info: "Room name and size are required", field: "name" },
    });
  }
  const newRoom = {
    id: v4(),
    name: room.name,
    size: room.size,
    password: room?.password,
    firstPlayer: ws.id,
  };
  rooms.push(newRoom);
  const { id, name, size } = newRoom;
  sendToClient(ws, { event: SocketEvents.CREATE_ROOM_SUCCESS, data: { id } });
  sendToAllClients({
    event: SocketEvents.ADD_ROOM,
    data: { id, name, size, password: newRoom.password ? true : false },
  });
};

export const handleJoinRoom = (ws: WebSocket.WebSocket, room: { id: string; password?: string }) => {
  const targetRoom = rooms.find((r) => r.id === room.id);
  if (!targetRoom) {
    return sendToClient(ws, { event: SocketEvents.JOIN_ROOM_ERROR, data: { info: "Room not found" } });
  } else if (targetRoom.password && targetRoom.password.trim() !== "" && targetRoom.password !== room.password) {
    return sendToClient(ws, { event: SocketEvents.JOIN_ROOM_ERROR, data: { info: "Wrong password" } });
  }
  if (targetRoom.firstPlayer === ws.id) {
    return sendToClient(ws, { event: SocketEvents.JOIN_ROOM_ERROR, data: { info: "You are already in this room" } });
  }
  if (targetRoom.firstPlayer) {
    targetRoom.secondPlayer = ws.id;
  }
  if (targetRoom.firstPlayer && targetRoom.secondPlayer) {
    rooms.splice(rooms.indexOf(targetRoom), 1);
    activeRooms[targetRoom.id] = targetRoom;
  }
  sendToClient(ws, { event: SocketEvents.JOIN_ROOM_SUCCESS, data: { id: targetRoom.id } });
  sendToAllClients({ event: SocketEvents.REMOVE_ROOM, data: { id: targetRoom.id } });
};
