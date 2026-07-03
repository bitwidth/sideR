export interface ServerConfiguration {
  port: number
  host: string
  backlog: number
}

/** 
 * Ref Events:
  close - server is closed - not emitted until all connections are let loose
  connection - Emitted when a new connection is made. socket is an instance of net.Socket.
  error - Emitted when an error occurs. Unlike net.Socket, the 'close' event will not be emitted directly following this event unless server.close() is manually called. See the example in discussion of server.listen().
  listening - Emitted when the server has been bound after calling server.listen().
  drop - When the number of connections reaches the threshold of server.maxConnections, the server will drop new connections and emit 'drop' event instead. If it is a TCP server, the argument is as follows, otherwise the argument is undefined.
*/
export type ServerEventName =  "close" | "connection" | "error" | "listening" | "drop"
export enum ServerEvent {
  CLOSE = "close",
  CONNECTION = "connection",
  ERROR = "error",
  LISTENING = "listening",
  DROP = "drop"
}
