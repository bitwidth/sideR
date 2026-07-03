import { DataStoreValueTypes } from "../constants/dataStore.js";

abstract class DataValue {
  type: DataStoreValueTypes;
  constructor(_type: DataStoreValueTypes) {}

  abstract serialize<Type>(input: Type): string;
  abstract deserialize<Type>(input: string): Type;
}

class ListValue extends DataValue {
  value: any[] = [];
  constructor() {
    super(DataStoreValueTypes.LIST);
  }

  serialize(): string {
    try {
      return JSON.stringify(this.value);
    } catch (e) {
      return "";
    }
  }

  deserialize<Array>(input: string): Array {
    try {
      return JSON.parse(input);
    } catch (e) {
      return [] as Array;
    }
  }
}

class SetValue extends DataValue {
  readonly _type = DataStoreValueTypes.SET;

  constructor() {
    super(DataStoreValueTypes.SET);
  }

  serialize<Set>(input: Set): string {
    try {
      return JSON.stringify(input);
    } catch (e) {
      return "";
    }
  }

  deserialize<Set>(input: string): Set {
    try {
      return JSON.parse(input);
    } catch (e) {
      return [] as Set;
    }
  }
}

class HashValue extends DataValue {
  readonly _type = DataStoreValueTypes.HASH;

  constructor() {
    super(DataStoreValueTypes.HASH);
  }

  serialize<Hash>(input: Hash): string {
    try {
      return JSON.stringify(input);
    } catch (e) {
      return "";
    }
  }

  deserialize<Hash>(input: string): Hash {
    try {
      return JSON.parse(input);
    } catch (e) {
      return {} as Hash;
    }
  }
}

class StringValue extends DataValue {
  readonly _type = DataStoreValueTypes.STRING;

  constructor() {
    super(DataStoreValueTypes.STRING);
  }

  serialize<String>(input: String): string {
    return String(input);
  }

  deserialize<String>(input: string): String {
    return new String(input);
  }
}

class IntegerValue extends DataValue {
  readonly _type = DataStoreValueTypes.INTEGER;

  constructor() {
    super(DataStoreValueTypes.INTEGER);
  }

  serialize<Number>(input: Number): string {
    return String(input);
  }

  deserialize<Number>(input: string): Number {
    return new Number(input).valueOf();
  }
}
