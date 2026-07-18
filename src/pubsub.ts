import type { Socket } from "net";
import type { Connection } from "./index.js";
import type { CustomServer } from "./server.js";

export class PubSub {
  private static channelsSubscribers: Map<string, Set<string>> = new Map();
  private static subscribers: Map<string, Array<Connection>> = new Map();

  static subscribe(channel: string, connection: Connection) {
    if (!PubSub.channelsSubscribers.has(channel)) {
      console.log(`Creating channel: ${channel} as it was not found.`);
      PubSub.channelsSubscribers.set(channel, new Set());
    }

    if (!PubSub.subscribers.has(channel)) {
      PubSub.subscribers.set(channel, []);
    }

    if (!PubSub.channelsSubscribers.get(channel)!.has(connection.id)) {
      PubSub.channelsSubscribers.get(channel)?.add(connection.id);
      PubSub.subscribers.get(channel)?.push(connection);
    }
  }

  static unsubscribe(channel: string, connection: Connection) {
    if (!PubSub.channelsSubscribers.has(channel)) {
      console.log(`Channel not found`);
      return null;
    }

    const indexAt = PubSub.subscribers
      .get(channel)!
      .findIndex((value) => value.id === connection.id);
    if (indexAt >= 0) {
      PubSub.subscribers.get(channel)?.splice(indexAt, 1);
      PubSub.channelsSubscribers.get(channel)?.delete(connection.id);
    }
  }

  static publish(channel: string, message: string, error?: any) {
    console.log(channel, PubSub.channelsSubscribers);
    if (!PubSub.channelsSubscribers.has(channel)) {
      console.log(`Can't publish to channel that doesn't exist`);
      return null;
    }

    const connections = PubSub.subscribers.get(channel);
    if (!connections || (connections && !connections.length)) {
      console.log(`No subscribers found for channel.`);
      return null;
    }

    connections.forEach((connection) => {
      connection.respond(message, error);
    });
  }

  static connectionCleanUp(connection: Connection) {
    console.log(`PubSub clean up is running`);
    // Traverse through channelsSubscribers and fetch all the channels to remove from
    const prospectChannelsToRemoveFrom: Set<string> = new Set();
    PubSub.channelsSubscribers.entries().forEach(([channel, connectionSet]) => {
      if (connectionSet.has(connection.id)) {
        prospectChannelsToRemoveFrom.add(channel);
      }
    });

    if (prospectChannelsToRemoveFrom.size <= 0) {
      return null;
    }

    // For each channel delete this connection
    for (const channel of Array.from(prospectChannelsToRemoveFrom)) {
      for (let i = 0; i < PubSub.subscribers.get(channel)!.length; i++) {
        if (PubSub.subscribers.get(channel)![i]!.id === connection.id) {
          PubSub.subscribers.get(channel)!.splice(i, 1);
          PubSub.channelsSubscribers.get(channel)?.delete(connection.id);
          break;
        }
      }
    }

    console.log(
      `PubSub clean up for channels: `,
      prospectChannelsToRemoveFrom,
      `for conn: `,
      connection.socket.remoteAddress,
      connection.socket.remotePort,
    );
  }
}
