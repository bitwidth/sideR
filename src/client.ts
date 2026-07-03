import net from "node:net";
import * as readline from "node:readline/promises";
import {
  DEFAULT_SERVER_CONFIGURATION,
  RETRY_INTERVAL_MS,
} from "./constants/configs.js";
import { stdin, stdout } from "node:process";

const clientSocket = new net.Socket({});
let clientReconnectIntervalId: NodeJS.Timeout | undefined = undefined;
let globalReadlineInstance: readline.Interface | undefined = undefined;

const registerSocketEvents = (socket: net.Socket) => {
  socket.on("connect", (...args) => console.log("[socket] connect", ...args));
  socket.on("connectionAttempt", (...args) =>
    console.log("[socket] connectionAttempt", ...args),
  );
  socket.on("connectionAttemptFailed", (...args) =>
    console.log("[socket] connectionAttemptFailed", ...args),
  );
  socket.on("connectionAttemptTimeout", (...args) =>
    console.log("[socket] connectionAttemptTimeout", ...args),
  );
  socket.on("data", (...args) => {
    console.log("[socket] data", args[0].toLocaleString());
    // const response = args[0].toLocaleString();
    // const responseJSON = JSON.parse(response);
    // console.log(responseJSON);
    const allResponses = args[0].toLocaleString();
    const responses = allResponses.split("\n").filter((value) => !!value);
    let currentCount = 0;
    for (const response of responses) {
      const responseJSON = JSON.parse(response.trim());
      console.log(responseJSON);
    }
  });
  socket.on("drain", (...args) => console.log("[socket] drain", ...args));
  socket.on("end", (...args) => console.log("[socket] end", ...args));
  socket.on("error", (...args) => console.log("[socket] error", ...args));
  socket.on("finish", (...args) => {
    console.log("[socket] finish - retrying connection", ...args);
    if (!!globalReadlineInstance) {
      globalReadlineInstance.close();
    }
    clientReconnectIntervalId = setInterval(connectToServer, RETRY_INTERVAL_MS);
  });
  // socket.on("lookup", (...args) => console.log("[socket] lookup", ...args))
  // socket.on("pause", (...args) => console.log("[socket] pause", ...args))
  // socket.on("pipe", (...args) => console.log("[socket] pipe", ...args))
  // socket.on("readable", (...args) => {
  //   console.log("[socket] readable", ...args)
  //   console.log("[socket] reading now")
  //   socket.read()
  // })
  // socket.on("ready", (...args) => console.log("[socket] ready", ...args))
  // socket.on("resume", (...args) => console.log("[socket] resume", ...args))
  socket.on("timeout", (...args) => console.log("[socket] timeout", ...args));
  socket.on("unpipe", (...args) => console.log("[socket] unpipe", ...args));
};

registerSocketEvents(clientSocket);
// Calls socket resume as of now

const connectToServer = () => {
  clientSocket.connect(
    {
      port: DEFAULT_SERVER_CONFIGURATION.port,
      host: DEFAULT_SERVER_CONFIGURATION.host,
      // Idk what these 2 below are
      // localAddress: "127.0.0.1",
      // localPort: serverConfiguration.port,
    },
    () => {
      if (!!clientReconnectIntervalId) {
        clearInterval(clientReconnectIntervalId);
        clientReconnectIntervalId = undefined;
      }
      sampleEchoScript(clientSocket);
    },
  );
};

connectToServer();

const sampleEchoScript = async (socket: net.Socket) => {
  globalReadlineInstance = readline.createInterface({
    input: stdin,
    output: stdout,
  });
  while (true) {
    const newInput = await globalReadlineInstance.question(
      "Do you have an input for the server?\n",
    );
    if (newInput == "q") {
      globalReadlineInstance.close();
      socket.end();
      break;
    } else {
      console.log("Sending data over");
      socket.write(newInput);
    }
  }

  // // Chunked data
  // setTimeout(() => {
  //   console.log("Sending data over")
  //   socket.write("SET name vi");
  // }, 5000);

  // setTimeout(() => {
  //   console.log("Sending data over")
  //   socket.write("vek;GET nam");
  // }, 7000);

  // setTimeout(() => {
  //   console.log("Sending data over")
  //   socket.write("e;DEL name");
  // }, 8000);

  //   setTimeout(() => {
  //   console.log("Sending data over")
  //   socket.write(";");
  // }, 10000);
};
