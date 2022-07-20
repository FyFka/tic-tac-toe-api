import { v4 } from "uuid";
import WebSocket from "ws";
import { gameRooms, rooms } from "./constants";
import { checkWin, getCurrentTurn, removeGameRoom, toActiveGameRoom } from "./helpers";
import { IRoom } from "./interfaces/IRoom";
import { sendToAllClients, sendToClient } from "./sender";
import { GameSymbol } from "./interfaces/IGameSymbol";
import { SocketEvents } from "./interfaces/IMessage";
import { GameResult } from "./interfaces/IGameResult";

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
  if (room.size < 3 || room.size > 12) {
    return sendToClient(ws, {
      event: SocketEvents.CREATE_ROOM_ERROR,
      data: { info: "Room size must be between 3 and 12", field: "size" },
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
    gameRooms[targetRoom.id] = toActiveGameRoom(targetRoom);
  }
  sendToClient(ws, { event: SocketEvents.JOIN_ROOM_SUCCESS, data: { id: targetRoom.id } });
  sendToAllClients({ event: SocketEvents.REMOVE_ROOM, data: { id: targetRoom.id } });
};

export const handleCanPlay = (ws: WebSocket, targetRoom: { id: string }) => {
  const selectedRoom = rooms.find((r) => r.id === targetRoom.id) || gameRooms[targetRoom.id];
  if (!selectedRoom || !selectedRoom.players.has(ws)) {
    return sendToClient(ws, { event: SocketEvents.CAN_PLAY_ERROR });
  }
  sendToClient(ws, { event: SocketEvents.CAN_PLAY_SUCCESS, data: { size: selectedRoom.size } });
  if (gameRooms[targetRoom.id] && selectedRoom.players.size === 2) {
    const turn = getCurrentTurn(gameRooms[targetRoom.id]);
    sendToClient(turn.currentTurn, {
      event: SocketEvents.SYMBOL,
      data: { player: gameRooms[targetRoom.id].players.get(turn.currentTurn) },
    });
    sendToClient(turn.nextTurn, {
      event: SocketEvents.SYMBOL,
      data: { player: gameRooms[targetRoom.id].players.get(turn.nextTurn) },
    });
  }
};

export const handleTurn = (ws: WebSocket, targetRoom: { id: string; row: number; cell: number }) => {
  if (gameRooms[targetRoom.id] && gameRooms[targetRoom.id].players.size === 2) {
    const selectedRoom = gameRooms[targetRoom.id];
    const turn = getCurrentTurn(gameRooms[targetRoom.id]);
    if (turn.currentTurn !== ws) {
      return sendToClient(ws, { event: SocketEvents.TURN_ERROR, data: { info: "It's not your turn" } });
    }
    if (selectedRoom.board[targetRoom.row][targetRoom.cell] !== "") {
      return sendToClient(ws, { event: SocketEvents.TURN_ERROR, data: { info: "This cell is already taken" } });
    }
    selectedRoom.turn += 1;
    selectedRoom.board[targetRoom.row][targetRoom.cell] = selectedRoom.players.get(turn.currentTurn)!;
    selectedRoom.isfirstPlayerTurn = !selectedRoom.isfirstPlayerTurn;
    sendToClient(turn.currentTurn, {
      event: SocketEvents.TURN,
      data: { board: selectedRoom.board, turn: gameRooms[targetRoom.id].players.get(turn.nextTurn) },
    });
    sendToClient(turn.nextTurn, {
      event: SocketEvents.TURN,
      data: { board: selectedRoom.board, turn: gameRooms[targetRoom.id].players.get(turn.nextTurn) },
    });
    const result = checkWin(selectedRoom, targetRoom.row, targetRoom.cell, selectedRoom.players.get(turn.currentTurn)!);
    if (result !== GameResult.IN_PROGRESS) {
      sendToClient(turn.currentTurn, {
        event: SocketEvents.GAME_RESULT,
        data: { info: result },
      });
      sendToClient(turn.nextTurn, {
        event: SocketEvents.GAME_RESULT,
        data: { info: result },
      });
      removeGameRoom(targetRoom.id);
    }
  }
};
