import { CommandHandler } from "./commandHandler.js";
import { ALLOWED_COMMANDS, REDIS_COMMANDS } from "./constants/commands.js";
import { DEFAULT_SERVER_CONFIGURATION } from "./constants/configs.js";
import { SERVER_INTERNAL_ERROR_CODES } from "./constants/errorCodes.js";
import { STATUSES } from "./constants/response.js";
import { ProtocolDelimiterParser } from "./parser.js";
import { CustomServer } from "./server.js";
import { DataStore } from "./store.js";
import { ServerEvent } from "./types/server/index.js";
import { logArgs } from "./utils/log.js";
import { CommandValidator } from "./validator.js";
import * as net from "node:net";

const redisServer = new CustomServer();
DataStore.restore();

class Connection {
  socket: net.Socket;
  parser: ProtocolDelimiterParser;
  commandHandler: CommandHandler;

  constructor(socket: net.Socket) {
    this.socket = socket;
    this.parser = new ProtocolDelimiterParser(ALLOWED_COMMANDS, ";");
    this.commandHandler = new CommandHandler();
  }

  respond(data: any, error: Error | undefined) {
    let result: any = {
      status: undefined,
      message: undefined,
      data: undefined,
    };

    if (error) {
      result.status = STATUSES.ERROR;
      result.message = error.message;
    } else {
      if (data == undefined || data == null) {
        result.status = STATUSES.EMPTY;
        result.data = "undefined";
      } else {
        result.status = STATUSES.OK;
        result.data = data;
      }
    }
    console.log(result);
    this.socket.write(`${JSON.stringify(result)}\n`);
  }

  destroy() {
    this.socket.destroy();
    console.log(
      "Socket destroyed",
      this.socket.remoteAddress,
      this.socket.remotePort,
    );
  }
}

function socketDataHandler(connection: Connection, data: Buffer) {
  try {
    const socketInputString = data.toString() ?? "";
    const socketCommands = connection.parser.pipe(socketInputString) ?? [];

    for (const command of socketCommands) {
      const validCommand = CommandValidator.validateCommandShape(command);
      const result = connection.commandHandler
        .setCommand(validCommand)
        .execute();
      connection.respond(result, undefined);
    }
  } catch (error: any) {
    console.error("NOT VALID: ", error.message, error);
    connection.respond(undefined, error);
  }
}

function serverErrorHandler(error: any) {
  if (error.code === SERVER_INTERNAL_ERROR_CODES.EADDRINUSE) {
    console.error("Address already in use");
    return;
  }
}

function serverConnectionHandler(...args: any) {
  // logArgs(args)
  // args[0] = Socket
  console.info("New connection!");
  const socket: net.Socket = args[0];
  console.log(socket.remoteAddress, socket.remotePort);
  const connection = new Connection(socket);
  socket.on("data", (buffer: Buffer) => {
    socketDataHandler(connection, buffer);
  });

  socket.on("end", () => {
    console.log("Socket ended.");
  });

  socket.on("error", () => {
    connection.destroy();
  });

  socket.on("close", () => {
    connection.destroy();
  });
}

function serverListeningHandler(...args: any) {
  // logArgs(args)
  // args = empty arr
  console.info("Started listening: ", DEFAULT_SERVER_CONFIGURATION);
}

redisServer.on(ServerEvent.CONNECTION, serverConnectionHandler);
redisServer.on(ServerEvent.ERROR, serverErrorHandler);
redisServer.on(ServerEvent.LISTENING, serverListeningHandler);
redisServer.start(DEFAULT_SERVER_CONFIGURATION);
