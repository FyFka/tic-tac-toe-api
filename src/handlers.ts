import { v4 } from "uuid";
import WebSocket from "ws";
import { activeRooms, rooms } from "./constants";
import { getCurrentTurn, toGameRoom } from "./helpers";
import { IRoom } from "./interfaces/IRoom";
import { sendToAllClients, sendToClient } from "./sender";
import { GameSymbol } from "./interfaces/IPlayer";
import { SocketEvents } from "./interfaces/IMessage";

export const handlePing = (ws: WebSocket) => {
  sendToClient(ws, { event: SocketEvents.PONG });
};

export const handleGetRooms = (ws: WebSocket) => {
  sendToClient(ws, {
    event: SocketEvents.GET_ROOMS,
    data: rooms.map(({ id, name, size, password }) => ({ id, name, size, password: password ? true : false })),
  });
};

export const handleCreateRoom = (ws: WebSocket, room: Partial<IRoom>) => {
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
    players: new Map(),
  };
  newRoom.players.set(ws, GameSymbol.UNKNOWN);
  rooms.push(newRoom);
  const { id, name, size } = newRoom;
  sendToClient(ws, { event: SocketEvents.CREATE_ROOM_SUCCESS, data: { id } });
  sendToAllClients({
    event: SocketEvents.ADD_ROOM,
    data: { id, name, size, password: newRoom.password ? true : false },
  });
};

export const handleJoinRoom = (ws: WebSocket, room: { id: string; password?: string }) => {
  const targetRoom = rooms.find((r) => r.id === room.id);
  if (!targetRoom) {
    return sendToClient(ws, { event: SocketEvents.JOIN_ROOM_ERROR, data: { info: "Room not found" } });
  } else if (targetRoom.password && targetRoom.password !== room.password) {
    return sendToClient(ws, { event: SocketEvents.JOIN_ROOM_ERROR, data: { info: "Wrong password" } });
  } else if (targetRoom.players.has(ws)) {
    return sendToClient(ws, { event: SocketEvents.JOIN_ROOM_ERROR, data: { info: "You are already in this room" } });
  } else if (targetRoom.players.size >= 2) {
    return sendToClient(ws, { event: SocketEvents.JOIN_ROOM_ERROR, data: { info: "Room is full" } });
  }
  targetRoom.players.set(ws, GameSymbol.UNKNOWN);
  if (targetRoom.players.size === 2) {
    rooms.splice(rooms.indexOf(targetRoom), 1);
    activeRooms[targetRoom.id] = toGameRoom(targetRoom);
  }
  sendToClient(ws, { event: SocketEvents.JOIN_ROOM_SUCCESS, data: { id: targetRoom.id } });
  sendToAllClients({ event: SocketEvents.REMOVE_ROOM, data: { id: targetRoom.id } });
};

export const handleCanPlay = (ws: WebSocket, targetRoom: { id: string }) => {
  const selectedRoom = rooms.find((r) => r.id === targetRoom.id) || activeRooms[targetRoom.id];
  if (!selectedRoom || !selectedRoom.players.has(ws)) {
    return sendToClient(ws, { event: SocketEvents.CAN_PLAY_ERROR });
  }
  sendToClient(ws, { event: SocketEvents.CAN_PLAY_SUCCESS, data: { size: selectedRoom.size } });
  if (activeRooms[targetRoom.id] && selectedRoom.players.size === 2) {
    const turn = getCurrentTurn(activeRooms[targetRoom.id]);

    sendToClient(turn.currentTurn, {
      event: SocketEvents.SYMBOL,
      data: { player: activeRooms[targetRoom.id].players.get(turn.currentTurn) },
    });

    sendToClient(turn.nextTurn, {
      event: SocketEvents.SYMBOL,
      data: { player: activeRooms[targetRoom.id].players.get(turn.nextTurn) },
    });
  }
};

export const handleTurn = (ws: WebSocket, targetRoom: { id: string; row: number; cell: number }) => {
  if (activeRooms[targetRoom.id] && activeRooms[targetRoom.id].players.size === 2) {
    const selectedRoom = activeRooms[targetRoom.id];
    const turn = getCurrentTurn(activeRooms[targetRoom.id]);

    if (turn.currentTurn !== ws) {
      return sendToClient(ws, { event: SocketEvents.TURN_ERROR, data: { info: "It's not your turn" } });
    }
    if (selectedRoom.board[targetRoom.row][targetRoom.cell] !== "") {
      return sendToClient(ws, { event: SocketEvents.TURN_ERROR, data: { info: "This cell is already taken" } });
    }

    selectedRoom.board[targetRoom.row][targetRoom.cell] = selectedRoom.players.get(turn.currentTurn)!;
    selectedRoom.isfirstPlayerTurn = !selectedRoom.isfirstPlayerTurn;

    sendToClient(turn.currentTurn, {
      event: SocketEvents.TURN,
      data: { board: selectedRoom.board, turn: activeRooms[targetRoom.id].players.get(turn.nextTurn) },
    });
    sendToClient(turn.nextTurn, {
      event: SocketEvents.TURN,
      data: { board: selectedRoom.board, turn: activeRooms[targetRoom.id].players.get(turn.nextTurn) },
    });
  }
};
