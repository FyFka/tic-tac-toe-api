export interface IRoom {
  name: string;
  size: number;
  password?: string;
}

export interface IGameRoom extends IRoom {
  board: Array<Array<number>>;
  xPlayerId?: string;
  oPlayerId?: string;
}

export enum SocketEvents {
  CREATE_ROOM = "CREATE_ROOM",
  CREATE_ROOM_ERROR = "CREATE_ROOM_ERROR",
  GET_ROOMS = "GET_ROOMS",
  ADD_ROOM = "ADD_ROOM",
  REMOVE_ROOM = "REMOVE_ROOM",
  INCORRECT_EVENT = "INCORRECT_EVENT",
}

export interface IMessage<T> {
  event: SocketEvents;
  data?: T;
}
