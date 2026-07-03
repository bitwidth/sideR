import { readFileSync, writeFileSync } from "node:fs";
import { DEFAULT_DATASTORE_CONFIGURATION } from "./constants/configs.js";
import { DataStoreErrorMessages } from "./constants/errorMessages.js";
import { ConverterUtils } from "./utils/converters.js";
import { InfoMessages } from "./constants/infoMessages.js";
import type { DataStoreValueTypes } from "./constants/dataStore.js";

interface DataStoreMetadataDetails {
  _type: DataStoreValueTypes;
  _createdAtTZ?: string;
  _updatedAtTZ?: string;
  _lastAccessedAtTZ?: string | undefined;
  _expiresAtTZ?: string | undefined;
}

export class DataStoreMetadata {
  _type: DataStoreValueTypes;
  _createdAtTZ: string;
  _updatedAtTZ: string;
  _lastAccessedAtTZ: string | undefined;
  _expiresAtTZ: string | undefined;

  constructor(details?: DataStoreMetadataDetails) {
    const currentTimeWithTZ = new Date().toISOString();

    this._type = details?._type ?? DataStoreValueTypes.STRING;
    this._createdAtTZ = details?._createdAtTZ ?? currentTimeWithTZ;
    this._updatedAtTZ = details?._updatedAtTZ ?? currentTimeWithTZ;
    this._lastAccessedAtTZ = details?._lastAccessedAtTZ ?? currentTimeWithTZ;
    this._expiresAtTZ = details?._expiresAtTZ ?? undefined;
  }

  public get currentDateTimeTZString(): string {
    return new Date().toISOString();
  }

  public get currentDateTimeEpoch(): number {
    return new Date().getTime();
  }

  public get type(): DataStoreValueTypes {
    return this._type;
  }

  public get createdAtTZ() {
    if (!this._createdAtTZ) {
      this.createdAtTZ = this.currentDateTimeTZString;
    }
    return this._createdAtTZ;
  }

  public get updatedAtTZ() {
    return this._updatedAtTZ;
  }

  public get lastAccessedAtTZ(): string | undefined {
    return this._lastAccessedAtTZ;
  }

  public get expiresAtTZ(): string | undefined {
    return this._expiresAtTZ;
  }

  public set type(type: DataStoreValueTypes) {
    console.log("setting type", type);
    this._type = type;
  }

  public set createdAtTZ(dateISOString: string) {
    if (dateISOString) {
      this._createdAtTZ = new Date(dateISOString).toISOString();
    } else {
      this._createdAtTZ = this.currentDateTimeTZString;
    }
  }

  public set updatedAtTZ(dateISOString: string) {
    if (dateISOString) {
      this._updatedAtTZ = new Date(dateISOString).toISOString();
    } else {
      this._updatedAtTZ = this.currentDateTimeTZString;
    }
  }

  public set lastAccessedAtTZ(dateISOString: string) {
    if (dateISOString) {
      this._lastAccessedAtTZ = new Date(dateISOString).toISOString();
    } else {
      this._lastAccessedAtTZ = this.currentDateTimeTZString;
    }
  }

  public setExpirationSeconds(seconds: number) {
    this.expiresAtTZ = seconds;
  }

  public set expiresAtTZ(seconds: number) {
    if (seconds > -1) {
      this._expiresAtTZ = new Date(
        this.currentDateTimeEpoch +
          ConverterUtils.convertSecondsToMilliSeconds(seconds),
      ).toISOString();
    }
  }

  public get isKeyExpired(): boolean {
    if (!this.expiresAtTZ) {
      return false;
    }

    if (this.expiresAtTZ <= this.currentDateTimeTZString) {
      return true;
    } else {
      return false;
    }
  }
}

export class DataStore {
  private static database: Map<string, any> = new Map<string, any>();
  private static metadata: Map<string, DataStoreMetadata> = new Map<
    string,
    DataStoreMetadata
  >();

  private static log(...args: any[]) {
    console.log(...args);
  }

  private static getMetadata(
    key: string,
    shouldInit: boolean = false,
  ): DataStoreMetadata {
    if (!this.metadata.has(key) && shouldInit) {
      this.initMetadata(key);
    }

    return this.metadata.get(key)!;
  }

  private static initMetadata(key: string): DataStoreMetadata {
    const hasMetadata = this.metadata.has(key);

    if (!hasMetadata) {
      this.metadata.set(key, new DataStoreMetadata());
    }

    return this.metadata.get(key)!;
  }

  public static setExpirationInSeconds(key: string, seconds: number) {
    this.getMetadata(key, true).setExpirationSeconds(seconds);
  }

  public static handleExpiration(metadata: DataStoreMetadata, key: string) {
    if (!metadata) {
      return false;
    }

    if (metadata.isKeyExpired) {
      this.delete(key);
      return true;
    }

    return false;
  }

  public static findOne(key: string) {
    const metadata: DataStoreMetadata = this.getMetadata(key, false);
    const isExpired = this.handleExpiration(metadata, key);
    if (metadata && !isExpired) {
      metadata.lastAccessedAtTZ = metadata.currentDateTimeTZString;
      return this.database.get(key);
    }
  }

  public static findAllKeys() {
    this.database.keys().forEach((key) => {
      const metadata: DataStoreMetadata = this.getMetadata(key, false);
      this.handleExpiration(metadata, key);
    });
    return [...this.database.keys()].sort();
  }

  public static upsert(
    key: string,
    value: any,
    expirationInSeconds: number | undefined,
  ) {
    const metadata: DataStoreMetadata = this.getMetadata(key, false);

    if (metadata) {
      const isExpired = this.handleExpiration(metadata, key);

      if (!isExpired) {
        metadata.updatedAtTZ = metadata.currentDateTimeTZString;
      }
    } else {
      this.initMetadata(key);
    }

    if (expirationInSeconds != undefined && expirationInSeconds > -1) {
      this.setExpirationInSeconds(key, expirationInSeconds);
    }

    this.database.set(key, value);
    return value;
  }

  public static delete(key: string) {
    this.database.delete(key);
    this.metadata.delete(key);
  }

  public static exists(key: string) {
    const metadata: DataStoreMetadata = this.getMetadata(key, false);
    this.handleExpiration(metadata, key);
    return this.database.has(key);
  }

  public static changeCountBy(key: string, count: number) {
    const value = this.database.get(key);
    let numericValue = Number(value);
    if (!isNaN(numericValue)) {
      numericValue += count;
      this.upsert(key, numericValue.toString(), undefined);
      return numericValue;
    } else {
      return undefined;
    }
  }

  public static getTTL(key: string): number | undefined {
    const metadata = this.getMetadata(key, false);
    if (!metadata) {
      throw new Error(DataStoreErrorMessages.TTL_NO_KEY_FOUND());
    }
    const expirationTimeTZ = metadata.expiresAtTZ;
    const isExpired = this.handleExpiration(metadata, key);
    if (!expirationTimeTZ || isExpired) {
      return undefined;
    }

    const currentTimeMs = metadata.currentDateTimeEpoch;
    const expirationTimeMs = new Date(expirationTimeTZ).getTime();
    return ConverterUtils.convertMilliSecondsToSeconds(
      expirationTimeMs - currentTimeMs,
    );
  }

  public static listPush(key: string, value: string[], end: boolean = false) {
    let metadata = this.getMetadata(key, false);
    if (!metadata) {
      metadata = this.initMetadata(key);
      metadata.type = DataStoreValueTypes.LIST;
      this.database.set(key, []);
    }

    if (metadata.type !== DataStoreValueTypes.LIST) {
      throw new Error(DataStoreErrorMessages.LIST_PUSH_INVALID_TYPE());
    }

    const list = this.database.get(key) as string[];
    if (end) {
      list.push(...value);
    } else {
      list.unshift(...value);
    }

    return list.length;
  }

  public static listGet(key: string, start: number, end: number) {
    const metadata = this.getMetadata(key, false);

    if (!metadata) {
      return null;
    }

    let actualStart = start;
    let actualEnd = end;

    // Range: if the range is -1 then get the list from the back
    // if the range is from 0 then fetch it from
    if (start > this.database.get(key).length) {
      actualStart = this.database.get(key).length - 1;
    } else if (start < 0) {
      actualStart = this.database.get(key).length + start;
    }
    if (end > this.database.get(key).length) {
      actualEnd = this.database.get(key).length - 1;
    } else if (end < 0) {
      actualEnd = this.database.get(key).length + end;
    }

    const list = this.database.get(key) as string[];
    return list.slice(actualStart, actualEnd + 1);
  }

  public static setAdd(key: string, value: string[], end: boolean = false) {
    let metadata = this.getMetadata(key, false);
    if (!metadata) {
      metadata = this.initMetadata(key);
      metadata.type = DataStoreValueTypes.SET;
      this.database.set(key, []);
    }

    if (metadata.type !== DataStoreValueTypes.SET) {
      throw new Error(DataStoreErrorMessages.LIST_PUSH_INVALID_TYPE());
    }

    const list = this.database.get(key) as string[];
    if (end) {
      list.push(...value);
    } else {
      list.unshift(...value);
    }

    return list.length;
  }

  public static setGet(key: string) {
    const metadata = this.getMetadata(key, false);

    if (!metadata) {
      return null;
    }

    // Range: if the range is -1 then get the list from the back
    // if the range is from 0 then fetch it from
    const list = this.database.get(key) as string[];
    return list.
  }

  public static persist() {
    try {
      this.log(
        InfoMessages.PERSISTING_DATA_TO_DISK_STORAGE(
          DEFAULT_DATASTORE_CONFIGURATION.dataLocation,
        ),
      );
      writeFileSync(
        DEFAULT_DATASTORE_CONFIGURATION.dataLocation,
        JSON.stringify(Array.from(this.database.entries())),
      );

      this.log(
        InfoMessages.PERSISTING_METADATA_TO_DISK_STORAGE(
          DEFAULT_DATASTORE_CONFIGURATION.metadataLocation,
        ),
      );
      writeFileSync(
        DEFAULT_DATASTORE_CONFIGURATION.metadataLocation,
        JSON.stringify(Array.from(this.metadata.entries())),
      );
    } catch (error) {
      console.error(DataStoreErrorMessages.FAILED_PERSIST());
      return false;
    }
    return true;
  }

  public static restore() {
    try {
      this.log(
        InfoMessages.RESTORING_DATA_FROM_DISK_STORAGE(
          DEFAULT_DATASTORE_CONFIGURATION.dataLocation,
        ),
      );
      const databaseString = readFileSync(
        DEFAULT_DATASTORE_CONFIGURATION.dataLocation,
      );

      this.log(
        InfoMessages.RESTORING_METADATA_FROM_DISK_STORAGE(
          DEFAULT_DATASTORE_CONFIGURATION.metadataLocation,
        ),
      );
      const metadataString = readFileSync(
        DEFAULT_DATASTORE_CONFIGURATION.metadataLocation,
      );

      this.database = new Map(JSON.parse(databaseString.toString()));
      JSON.parse(metadataString.toString()).forEach(([key, val]: any[]) => {
        this.metadata.set(key, new DataStoreMetadata(val));
      });
    } catch (error) {
      console.error(DataStoreErrorMessages.FAILED_RESTORE());
    }
  }
}
