import { MAX_LIMITS } from "./configs.js";

export enum REDIS_COMMANDS {
  SET = "SET",
  GET = "GET",
  DEL = "DEL",
  EXISTS = "EXISTS",
  KEYS = "KEYS",
  INCR = "INCR",
  DECR = "DECR",
  TTL = "TTL",
  SAVE = "SAVE",
  // List
  LPUSH = "LPUSH",
  RPUSH = "RPUSH",
  LRANGE = "LRANGE",
  // Set
  SADD = "SADD",
  SREM = "SREM",
  SMEMBERS = "SMEMBERS",
  // Hash
  HSET = "HSET",
  HGET = "HGET",
  HDEL = "HDEL",
  // Pub/Sub
  SUBSCRIBE = "SUBSCRIBE",
  PUBLISH = "PUBLISH",
}

export enum REDIS_MODIFIERS {
  EX = "EX",
}

export const REDIS_COMMAND_MODIFIERS = {
  [REDIS_COMMANDS.SET]: [REDIS_MODIFIERS.EX],
};

export const ALLOWED_COMMANDS = [
  REDIS_COMMANDS.SET,
  REDIS_COMMANDS.GET,
  REDIS_COMMANDS.DEL,
  REDIS_COMMANDS.EXISTS,
  REDIS_COMMANDS.KEYS,
  REDIS_COMMANDS.INCR,
  REDIS_COMMANDS.DECR,
  REDIS_COMMANDS.TTL,
  REDIS_COMMANDS.SAVE,
  REDIS_COMMANDS.LPUSH,
  REDIS_COMMANDS.RPUSH,
  REDIS_COMMANDS.LRANGE,
  REDIS_COMMANDS.SADD,
  REDIS_COMMANDS.SREM,
  REDIS_COMMANDS.SMEMBERS,
  REDIS_COMMANDS.HSET,
  REDIS_COMMANDS.HGET,
  REDIS_COMMANDS.HDEL,
];

export interface CommandModifiers {
  modifierLex: string;
  totalArgs: number;
  args: CommandValidationParamArg[];
}

export interface CommandValidationParamArg {
  name: string;
  type: ARG_TYPE;
  maxLength?: number | undefined;
  minLength?: number | undefined;
  max?: number;
  min?: number;
  size: string | undefined;
}

// Maybe keep some sort of concrete validators - and use totalArgs instead inside of it - so these set of properties can be used to verify the expected command shape
export interface CommandValidationParams {
  totalArgs: number;
  args: CommandValidationParamArg[];
  modifiers?: CommandModifiers[];
}

export enum ARG_TYPE {
  STRING = "string",
  INTEGER = "integer",
  LIST = "list",
}

export const COMMAND_VALIDATIONS: {
  [key: string]: CommandValidationParams[];
} = {
  [REDIS_COMMANDS.SET]: [
    {
      totalArgs: 4,
      args: [
        {
          name: "keyName",
          type: ARG_TYPE.STRING,
          maxLength: 255,
          minLength: 1,
          size: undefined,
        },
        {
          name: "valueForKey",
          type: ARG_TYPE.STRING,
          maxLength: undefined,
          minLength: undefined,
          size: "512M",
        },
      ],
      modifiers: [
        {
          modifierLex: REDIS_MODIFIERS.EX,
          totalArgs: 1,
          args: [
            {
              name: "expirationInSeconds",
              type: ARG_TYPE.INTEGER,
              max: MAX_LIMITS.INTEGER_MAX_LIMIT,
              min: 0,
              size: undefined,
            },
          ],
        },
      ],
    },
    {
      totalArgs: 2,
      args: [
        {
          name: "keyName",
          type: ARG_TYPE.STRING,
          maxLength: 255,
          minLength: 1,
          size: undefined,
        },
        {
          name: "valueForKey",
          type: ARG_TYPE.STRING,
          maxLength: undefined,
          minLength: undefined,
          size: "512M",
        },
      ],
    },
  ],
  [REDIS_COMMANDS.GET]: [
    {
      totalArgs: 1,
      args: [
        {
          name: "keyName",
          type: ARG_TYPE.STRING,
          maxLength: 255,
          minLength: 1,
          size: undefined,
        },
      ],
    },
  ],
  [REDIS_COMMANDS.DEL]: [
    {
      totalArgs: 1,
      args: [
        {
          name: "keyName",
          type: ARG_TYPE.STRING,
          maxLength: 255,
          minLength: 1,
          size: undefined,
        },
      ],
    },
  ],
  [REDIS_COMMANDS.EXISTS]: [
    {
      totalArgs: 1,
      args: [
        {
          name: "keyName",
          type: ARG_TYPE.STRING,
          maxLength: 255,
          minLength: 1,
          size: undefined,
        },
      ],
    },
  ],
  [REDIS_COMMANDS.KEYS]: [
    {
      totalArgs: 0,
      args: [],
    },
  ],
  [REDIS_COMMANDS.INCR]: [
    {
      totalArgs: 1,
      args: [
        {
          name: "keyName",
          type: ARG_TYPE.STRING,
          maxLength: 255,
          minLength: 1,
          size: undefined,
        },
      ],
    },
  ],
  [REDIS_COMMANDS.DECR]: [
    {
      totalArgs: 1,
      args: [
        {
          name: "keyName",
          type: ARG_TYPE.STRING,
          maxLength: 255,
          minLength: 1,
          size: undefined,
        },
      ],
    },
  ],
  [REDIS_COMMANDS.TTL]: [
    {
      totalArgs: 1,
      args: [
        {
          name: "keyName",
          type: ARG_TYPE.STRING,
          maxLength: 255,
          minLength: 1,
          size: undefined,
        },
      ],
    },
  ],
  [REDIS_COMMANDS.SAVE]: [
    {
      totalArgs: 0,
      args: [],
    },
  ],
  [REDIS_COMMANDS.LPUSH]: [
    {
      totalArgs: 2,
      args: [
        {
          name: "listName",
          type: ARG_TYPE.STRING,
          maxLength: 255,
          minLength: 1,
          size: undefined,
        },
        {
          name: "values",
          type: ARG_TYPE.LIST,
          maxLength: 255,
          minLength: 1,
          size: undefined,
        },
      ],
    },
  ],
  [REDIS_COMMANDS.RPUSH]: [
    {
      totalArgs: 2,
      args: [
        {
          name: "listName",
          type: ARG_TYPE.STRING,
          maxLength: 255,
          minLength: 1,
          size: undefined,
        },
        {
          name: "values",
          type: ARG_TYPE.LIST,
          maxLength: 255,
          minLength: 1,
          size: undefined,
        },
      ],
    },
  ],
  [REDIS_COMMANDS.LRANGE]: [
    {
      totalArgs: 3,
      args: [
        {
          name: "listName",
          type: ARG_TYPE.STRING,
          maxLength: 255,
          minLength: 1,
          size: undefined,
        },
        {
          name: "start",
          type: ARG_TYPE.INTEGER,
          max: MAX_LIMITS.INTEGER_MAX_LIMIT,
          min: MAX_LIMITS.INTEGER_MIN_LIMIT,
          size: undefined,
        },
        {
          name: "stop",
          type: ARG_TYPE.STRING,
          max: MAX_LIMITS.INTEGER_MAX_LIMIT,
          min: MAX_LIMITS.INTEGER_MIN_LIMIT,
          size: undefined,
        },
      ],
    },
  ],
  [REDIS_COMMANDS.SADD]: [
    {
      totalArgs: 2,
      args: [
        {
          name: "setName",
          type: ARG_TYPE.STRING,
          maxLength: 255,
          minLength: 1,
          size: undefined,
        },
        {
          name: "members",
          type: ARG_TYPE.LIST,
          maxLength: 255,
          minLength: 1,
          size: undefined,
        },
      ],
    },
  ],
  [REDIS_COMMANDS.SREM]: [
    {
      totalArgs: 2,
      args: [
        {
          name: "setName",
          type: ARG_TYPE.STRING,
          maxLength: 255,
          minLength: 1,
          size: undefined,
        },
        {
          name: "members",
          type: ARG_TYPE.LIST,
          maxLength: 255,
          minLength: 1,
          size: undefined,
        },
      ],
    },
  ],
  [REDIS_COMMANDS.SMEMBERS]: [
    {
      totalArgs: 1,
      args: [
        {
          name: "setName",
          type: ARG_TYPE.STRING,
          maxLength: 255,
          minLength: 1,
          size: undefined,
        },
      ],
    },
  ],
  // TODO: Redis does the multiple fields being set via a single command - as of now our system can only support one field at a time due to parser and validator limitations
  // I didnt have this far insight while designing Parser and the Validator.
  // Lesson learned. More abstraction needed.
  [REDIS_COMMANDS.HSET]: [
    {
      totalArgs: 3,
      args: [
        {
          name: "hashName",
          type: ARG_TYPE.STRING,
          maxLength: 255,
          minLength: 1,
          size: undefined,
        },
        {
          name: "field",
          type: ARG_TYPE.STRING,
          maxLength: 255,
          minLength: 1,
          size: undefined,
        },
        {
          name: "value",
          type: ARG_TYPE.STRING,
          maxLength: 255,
          minLength: 1,
          size: undefined,
        },
      ],
    },
  ],
  [REDIS_COMMANDS.HGET]: [
    {
      totalArgs: 2,
      args: [
        {
          name: "hashName",
          type: ARG_TYPE.STRING,
          maxLength: 255,
          minLength: 1,
          size: undefined,
        },
        {
          name: "field",
          type: ARG_TYPE.STRING,
          maxLength: 255,
          minLength: 1,
          size: undefined,
        },
      ],
    },
  ],
  [REDIS_COMMANDS.HDEL]: [
    {
      totalArgs: 2,
      args: [
        {
          name: "hashName",
          type: ARG_TYPE.STRING,
          maxLength: 255,
          minLength: 1,
          size: undefined,
        },
        {
          name: "field",
          type: ARG_TYPE.STRING,
          maxLength: 255,
          minLength: 1,
          size: undefined,
        },
      ],
    },
  ],
  [REDIS_COMMANDS.SUBSCRIBE]: [
    {
      totalArgs: 1,
      args: [
        {
          name: "channel",
          type: ARG_TYPE.STRING,
          maxLength: 255,
          minLength: 1,
          size: undefined,
        },
      ],
    },
  ],
  [REDIS_COMMANDS.PUBLISH]: [
    {
      totalArgs: 2,
      args: [
        {
          name: "channel",
          type: ARG_TYPE.STRING,
          maxLength: 255,
          minLength: 1,
          size: undefined,
        },
        {
          name: "message",
          type: ARG_TYPE.STRING,
          maxLength: 128000,
          minLength: 1,
          size: undefined,
        },
      ],
    },
  ],
};
