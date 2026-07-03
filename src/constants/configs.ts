export const IS_VERBOSE = process.env.VERBOSE == "true";

const DEFAULT_SERVER_PORT = "6379";
const DEFAULT_SERVER_HOST = "localhost";
/** Backlog
// Linux
    "/proc/sys/net/core/somaxconn"
    "/proc/sys/net/ipv4/tcp_max_syn_backlog"

// MacOS
if (process.platform === "darwin") {
  // No SYN-backlog equivalent on macOS/BSD.
const somaxconn = await readSysctl("kern.ipc.somaxconn");

// Windows or anything else: neither concept maps directly.
return { somaxconn: null, tcpMaxSynBacklog: null };

To avoid all this bullshit
Just gonna go with 128
*/
const DEFAULT_SERVER_BACKLOG = "128";

export const DEFAULT_SERVER_CONFIGURATION = {
  port: Number.parseInt(process.env.SERVER_PORT ?? DEFAULT_SERVER_PORT),
  host: process.env.SERVER_HOST ?? DEFAULT_SERVER_HOST,
  backlog: Number.parseInt(
    process.env.SERVER_BACKLOG ?? DEFAULT_SERVER_BACKLOG,
  ),
};

export const DEFAULT_DATASTORE_CONFIGURATION = {
  dataLocation: "./data.json",
  metadataLocation: "./metadata.json",
};

export const MAX_LIMITS = {
  INTEGER_MAX_LIMIT: 2147483647,
  INTEGER_MIN_LIMIT: -2147483648,
};

export const RETRY_INTERVAL_MS = 2000;
