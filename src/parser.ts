import type { CommandModifiers, CommandValidationParams } from "./constants/commands.js";
import { ParserErrorMessages } from "./constants/errorMessages.js";
import type { CommandShape } from "./types/commands/index.js";

export class ProtocolDelimiterParser {
  private allowedCommands: string[] = [];
  private activeCommands: string[] = [];
  public static delimiter: string = ";";

  private inputCommandsQueue: CommandShape[] = []
  private currentInput: CommandShape = {
    inputString: "",
    command: "",
    args: [],
  };

  constructor(commandList: string[], delimiter: string) {
    if (!commandList.length) {
      throw Error(ParserErrorMessages.NO_COMMANDS_FOUND_FOR_PARSER)
    }
    if (!delimiter) {
      throw Error(ParserErrorMessages.NO_DELIMITER_PROVIDED_FOR_PARSER)
    }

    this.allowedCommands = [...commandList];
    this.activeCommands = [...this.allowedCommands];

    ProtocolDelimiterParser.delimiter = delimiter;
  }

  private createCommandShape() {
    const commandToParse = this.currentInput.inputString.trim();
    let foundCommand = undefined;
    let foundArgs: string[] = [];

    // Find if it matches with any of our commands
    for(const command of this.activeCommands) {
      // This will be a problematic piece - if SET and SET EX would be a thing in future
      if (commandToParse.startsWith(command)) {
        foundCommand = command;
      }
    }

    // If matched with one of our commands, fetch all the args for it
    if (foundCommand) {
      const argsToParse = commandToParse.substring(foundCommand.length).trim();
      
      let prevIterator = 0;
      let inMiddleOfString = false;

      for(let iterator = 0; iterator < argsToParse.length; iterator++) {
        const charac = argsToParse[iterator];
        if (charac === "\"" || charac === "'") {
          inMiddleOfString = !inMiddleOfString;
        }

        if (charac === " " || charac === "\n" || charac === "\t" && !inMiddleOfString) {
          foundArgs.push(argsToParse.substring(prevIterator, iterator));
          prevIterator = iterator + 1;
        }

        // SUS piece - If at the end just push whatever we got as an arg
        // Not sure if this will fail or run into some edge case
        if ((argsToParse.length - 1) === iterator) {
          foundArgs.push(argsToParse.substring(prevIterator, iterator));
        }
      }
    } else {
      throw Error(ParserErrorMessages.UNKNOWN_COMMAND(""))
    }

    this.inputCommandsQueue.unshift({
      inputString: this.currentInput.inputString,
      command: foundCommand,
      args: [...foundArgs]
    });
  }

  private resetCommandShape() {
    this.currentInput = {
      inputString: "",
      command: "",
      args: []
    };
  }

  private inputCommandSanitize(commandString: string) {
    //TBD
  }

  setActiveCommands(commands: string[]) {
    this.activeCommands = commands
  }

  parseInput(inputString: string) {
    // Need to update it - so that the ; is escaped, or part of a string ; and should not be considered as delim
    let commandEnded = false;

    if(inputString.includes(ProtocolDelimiterParser.delimiter)) {
      commandEnded = true
    } else {
      this.currentInput.inputString += inputString;
    }

    if (commandEnded) {
      try {
        const delimPosition = inputString.indexOf(ProtocolDelimiterParser.delimiter);
        const inputBeforeDelim = inputString
          .substring(0, delimPosition + 1);
        const inputAfterDelim = inputString
          .substring(delimPosition + 1, inputString.length);
        
        this.currentInput.inputString += inputBeforeDelim;
        this.createCommandShape();
        this.resetCommandShape();
        this.parseInput(inputAfterDelim);
      } catch (error) {
        this.resetCommandShape();
        throw error;
      }
    }
  }

  consumeCommand(fromQueueEnd: boolean = false): CommandShape | undefined {
    if (fromQueueEnd) {
      return this.inputCommandsQueue.shift();
    } else {
      return this.inputCommandsQueue.pop();
    }
  }

  pipe(inputString: string, fromQueueEnd: boolean = false): CommandShape[] | undefined {
    this.parseInput(inputString);
    const data: CommandShape[] = [];
    while (this.inputCommandsQueue.length) {
      const datum = this.consumeCommand(fromQueueEnd);
      if (datum) {
        data.push(datum);
      }
    }
    return data;
  }
}