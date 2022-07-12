import WebSocket from "ws";

declare module "ws" {
  class _WS extends WebSocket {}
  export interface WebSocket extends _WS {
    id: string;
  }
}
