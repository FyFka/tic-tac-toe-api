export interface IRoom {
  name: string;
  size: number;
  password?: string;
}

export interface IGameRoom extends IRoom {
  id: string;
  firstPlayer?: string;
  secondPlayer?: string;
}

export interface IActiveGameRoom extends IGameRoom {
  board: Array<Array<number>>;
  turn: number;
  isXTurn: boolean;
}

export enum SocketEvents {
  CREATE_ROOM = "CREATE_ROOM",
  CREATE_ROOM_SUCCESS = "CREATE_ROOM_SUCCESS",
  CREATE_ROOM_ERROR = "CREATE_ROOM_ERROR",
  GET_ROOMS = "GET_ROOMS",
  ADD_ROOM = "ADD_ROOM",

  JOIN_ROOM = "JOIN_ROOM",
  JOIN_ROOM_SUCCESS = "JOIN_ROOM_SUCCESS",
  JOIN_ROOM_ERROR = "JOIN_ROOM_ERROR",

  REMOVE_ROOM = "REMOVE_ROOM",
  UNKNOWN_EVENT = "UNKNOWN_EVENT",
}

export interface IMessage<T> {
  event: SocketEvents;
  data?: T;
}
