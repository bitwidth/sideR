import {
  REDIS_COMMAND_MODIFIERS,
  REDIS_COMMANDS,
  REDIS_MODIFIERS,
} from "./constants/commands.js";
import { DataStore } from "./store.js";
import type { CommandShape } from "./types/commands/index.js";

export class CommandHandler {
  command: string = "";
  args: string[] = [];
  modifiers: CommandShape[] = [];

  private log(...args: any) {
    console.error(...args);
  }

  constructor(commandShape?: CommandShape) {
    if (commandShape) {
      this.setCommand(commandShape);
    }
  }

  setCommand(commandShape: CommandShape): CommandHandler {
    this.command = commandShape.command;
    this.args = commandShape.args ?? [];
    this.modifiers = commandShape.modifiers ?? [];

    return this;
  }

  private get(key: string) {
    return DataStore.findOne(key);
  }

  private set() {
    const key = this.args[0]!;
    const value = this.args[1]!;
    const expirationArgs = this.modifiers
      .filter((value) => value.command === REDIS_MODIFIERS.EX)
      .map((value) => value && value.args && value.args[0]);
    return DataStore.upsert(key, value, expirationArgs[0]);
  }

  private remove(key: string) {
    return DataStore.delete(key);
  }

  private exists(key: string) {
    return DataStore.exists(key);
  }

  private keys() {
    return DataStore.findAllKeys();
  }

  private changeCountBy(key: string, count: number) {
    return DataStore.changeCountBy(key, count);
  }

  private getTTL(key: string) {
    return DataStore.getTTL(key);
  }

  private persist() {
    return DataStore.persist();
  }

  private listPush(key: string, value: string[], end: boolean = false) {
    return DataStore.listPush(key, value, end);
  }

  private listGet(key: string, start: number, end: number) {
    return DataStore.listGet(key, start, end);
  }

  execute() {
    let result;

    switch (this.command) {
      case REDIS_COMMANDS.SET:
        result = this.set();
        break;
      case REDIS_COMMANDS.GET:
        result = this.get(this.args[0]!);
        break;
      case REDIS_COMMANDS.DEL:
        result = this.remove(this.args[0]!);
        break;
      case REDIS_COMMANDS.EXISTS:
        result = this.exists(this.args[0]!);
        break;
      case REDIS_COMMANDS.KEYS:
        result = this.keys();
        break;
      case REDIS_COMMANDS.INCR:
        result = this.changeCountBy(this.args[0]!, 1);
        break;
      case REDIS_COMMANDS.DECR:
        result = this.changeCountBy(this.args[0]!, -1);
        break;
      case REDIS_COMMANDS.TTL:
        result = this.getTTL(this.args[0]!);
        break;
      case REDIS_COMMANDS.SAVE:
        result = this.persist();
        break;
      case REDIS_COMMANDS.LPUSH:
        result = this.listPush(this.args[0]!, this.args.slice(1), false);
        break;
      case REDIS_COMMANDS.RPUSH:
        result = this.listPush(this.args[0]!, this.args.slice(1), true);
        break;
      case REDIS_COMMANDS.LRANGE:
        result = this.listGet(
          this.args[0]!,
          Number(this.args[1]!),
          Number(this.args[2]!),
        );
        break;
      default:
        this.log("Sorry, command not recognised");
    }

    return result;
  }
}
