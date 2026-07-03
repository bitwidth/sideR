export enum ServerErrorMessages {
  SERVER_CONFIGURATION_ABSENT = "Server configuration not provided, expected: { host: <string>, port: <number>, backlog: <number> }",
}

export const ParserErrorMessages = {
  NO_COMMANDS_FOUND_FOR_PARSER: "No commands were provided for parser",
  NO_DELIMITER_PROVIDED_FOR_PARSER: "No delimiter was provided for parser",
  UNKNOWN_COMMAND: (actual: string) => `Unknown command provided`,
};

export const ValidatorErrorMessages = {
  TOTAL_NUMBER_OF_ARGUMENTS_MISMATCH: (
    expected: number | string,
    actual: number | string,
  ) => `Expected ${expected} arguments , got ${actual}`,
  INVALID_MODIFIER: (actual: string) => `Invalid modifier: '${actual}'`,
  MISSING_ARGUMENT: (argName: string) => `Missing argument ${argName}`,
  LENGTH_OF_ARGUMENT_TOO_LONG: (
    argName: string,
    expected: number,
    actual: number,
  ) =>
    `Expected argument ${argName} to be maximum of length ${expected} got ${actual}`,
  LENGTH_OF_ARGUMENT_TOO_SHORT: (
    argName: string,
    expected: number,
    actual: number,
  ) =>
    `Expected argument ${argName} to be minimum of length ${expected} got ${actual}`,
  INVALID_NUMERIC_VALUE: (argName: string, actual: any) =>
    `Expected argument ${argName} to be number with 10 radix, got ${actual}`,
  OUT_OF_RANGE_NUMERIC_VALUE: (
    argName: string,
    actual: number,
    max?: number,
    min?: number,
  ) =>
    `Expected argument ${argName} to be in range - min:${min != undefined ? min : "-inf"} to max:${max != undefined ? max : "inf"}, got ${actual}`,
  UNEXPECTED_ERROR: () => `Unexpected error ocurred.`,
};

export const DataStoreErrorMessages = {
  TTL_NO_KEY_FOUND: () => `No such key found.`,
  FAILED_PERSIST: () => `Fatal error: Failed to PERSIST`,
  FAILED_RESTORE: () => `Fatal error: Failed to RESTORE, starting with EMPTY DB`,
  LIST_PUSH_INVALID_TYPE: () => `Invalid list push operation on a non-list value`,
};
