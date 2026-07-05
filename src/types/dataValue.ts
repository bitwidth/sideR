import { DataStoreValueTypes } from "../constants/dataStore.js";

abstract class DataValue<Type> {
  type: DataStoreValueTypes;
  constructor(_type: DataStoreValueTypes) {
    this.type = _type;
  }

  abstract serialize(input: Type): string;
  abstract deserialize(input: string): Type;
}

export class ListValue extends DataValue<any[]> {
  readonly _type = DataStoreValueTypes.LIST;
  value: any[] = [];

  constructor() {
    super(DataStoreValueTypes.LIST);
  }

  serialize(input: any[]): string {
    try {
      return JSON.stringify(input);
    } catch (e) {
      return "";
    }
  }

  deserialize(input: string): any[] {
    try {
      return JSON.parse(input);
    } catch (e) {
      return [];
    }
  }
}

export class SetValue extends DataValue<any[]> {
  readonly _type = DataStoreValueTypes.SET;
  value = new Set();

  constructor() {
    super(DataStoreValueTypes.SET);
  }

  serialize(input: any[]): string {
    try {
      return JSON.stringify(input);
    } catch (e) {
      return "";
    }
  }

  deserialize(input: string): any[] {
    try {
      return JSON.parse(input);
    } catch (e) {
      return [];
    }
  }
}

export class HashValue extends DataValue<Record<string, any>> {
  readonly _type = DataStoreValueTypes.HASH;
  value = new Map<string, any>();

  constructor() {
    super(DataStoreValueTypes.HASH);
  }

  serialize(input: Record<string, any>): string {
    try {
      return JSON.stringify(input);
    } catch (e) {
      return "";
    }
  }

  deserialize(input: string): Record<string, any> {
    try {
      return JSON.parse(input);
    } catch (e) {
      return {};
    }
  }
}

export class StringValue extends DataValue<string> {
  readonly _type = DataStoreValueTypes.STRING;
  value = "";

  constructor() {
    super(DataStoreValueTypes.STRING);
  }

  serialize(input: string): string {
    return String(input);
  }

  deserialize(input: string): string {
    return input;
  }
}

export class IntegerValue extends DataValue<number> {
  readonly _type = DataStoreValueTypes.INTEGER;
  value = undefined;

  constructor() {
    super(DataStoreValueTypes.INTEGER);
  }

  serialize(input: number): string {
    return String(input);
  }

  deserialize(input: string): number {
    return Number(input);
  }
}
