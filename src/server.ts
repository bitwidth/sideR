import net from 'node:net';
// import { IS_VERBOSE, DEFAULT_SERVER_CONFIGURATION } from './constants/configs.js';
// import { SERVER_INTERNAL_ERROR_CODES } from './constants/errorCodes.js';
// import { logArgs } from './utils/log.js';
import { ServerErrorMessages } from './constants/errorMessages.js';
import type { ServerConfiguration, ServerEventName } from './types/server/index.js';

export class CustomServer {
  private serverInstance: net.Server;

  constructor() {
    this.serverInstance = new net.Server();
  }

  private log(...args: any[]) {
    console.log(...args)
  }

  start(
    config: ServerConfiguration,
    listeningCallback?: (...args: any[]) => void
  ): net.Server {
    if (!config || !config.host || !config.port || !config.backlog) {
      throw Error(ServerErrorMessages.SERVER_CONFIGURATION_ABSENT);
    }

    this.serverInstance.listen(
      config.port,
      config.host,
      config.backlog,
      listeningCallback
    );

    this.serverInstance
    this.log(`Pending to start listening on: ${config.host}:${config.port}`);
    // this.log(`Started. Listening at ${config.host}:${config.port}`);
    return this.serverInstance;
  }

  stop() {
    this.serverInstance.close()
  }

  on(eventName: ServerEventName, listener: (...args: any) => void) {
    this.serverInstance.on(eventName, listener);
    // Future checks for unique listener only - so only 1 at a time listener is there
  }
}

// const registerEchoSocketOnConnection = (socket: net.Socket) => {
//   socket.on("data", (...args) => {
//     // logArgs(args)
//     console.log(args[0].toLocaleString())
//     socket.write(args[0]);
//   })
// }
