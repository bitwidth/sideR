# Redis Clone - Milestones + Architecture

## What Are We Building?

A simplified Redis-like server.

Not Redis-compatible.
Not production-ready.
Not distributed initially.

Architecture:

Clients
   |
  TCP
   |
Server
   |
In-Memory Store

The server stores data in memory and responds to commands.

---

# Milestone 1 — Single Client Key-Value Store

## Requirements

- Server starts successfully
- Listens on localhost:6379
- Client can connect
- Client can send commands
- Server responds

### Supported Commands

#### SET

Input:

SET name Vivek

Output:

OK

Effect:

name -> Vivek

stored in memory.

---

#### GET

Input:

GET name

Output:

Vivek

---

#### DEL

Input:

DEL name

Output:

1 if deleted
0 if key not found

---

## Questions Before Coding

How will the server:

- Accept TCP connections?
- Read incoming data?
- Determine command boundaries?
- Send responses?

---

# Milestone 2 — Multiple Clients

Support:

- Client A
- Client B
- Client C

connected simultaneously.

## Requirements

All clients see the same data.

Example:

Client A:

SET x 123

Client B:

GET x

Returns:

123

## Concepts

- Shared state
- Connection lifecycle
- Event-driven programming

---

# Milestone 3 — Basic Data Types

Current state:

Every value is a string.

Add:

### INCR

Input:

INCR counter

Output:

1
2
3

on successive calls.

## Questions

How do you know:

"123"

is numeric?

Should:

INCR name

fail?

What should the error look like?

---

# Milestone 4 — Expiration

Support:

SET session abc EX 60

Meaning:

expire in 60 seconds.

## Questions

Where do expirations live?

- Same Map?
- Separate structure?

How are expired keys removed?

Options:

- Lazy cleanup
- Background cleanup
- Hybrid approach

---

# Milestone 5 — Persistence

Current problem:

Stop server
↓
All data gone

Need:

Start server
↓
Data restored

## Requirements

Add:

SAVE

Writes state to disk.

## Questions

Format?

- JSON?
- Binary?
- Custom?

When loading:

What happens if the file is corrupt?

---

# Milestone 6 — Lists

Support:

LPUSH tasks a
LPUSH tasks b

Result:

[b,a]

### LRANGE

Input:

LRANGE tasks

Output:

b
a

## Concept

Move from:

Map<string,string>

To:

Map<string,RedisValue>

where RedisValue may be:

- String
- Number
- List

---

# Milestone 7 — Pub/Sub

Clients can subscribe.

### Client A

SUBSCRIBE chat

### Client B

PUBLISH chat hello

### Client A receives

hello

## Concepts

- Fan-out
- Event systems
- Connection management

---

# Milestone 8 — Replication

Architecture:

Primary
   |
Replica

## Requirement

Changes on primary eventually appear on replica.

## Questions

How does replica:

- Discover changes?
- Reconnect after failure?
- Catch up after downtime?

---

# Suggested Internal Architecture

Think in components.

Server
│
├── TCP Listener
│
├── Command Parser
│
├── Command Executor
│
├── Storage Engine
│
├── Expiration Manager
│
├── Persistence Manager
│
└── PubSub Manager

Each component should be independently understandable.

---

# First Week Objective

Not Redis.

Not persistence.

Not replication.

Not optimization.

Just prove:

telnet localhost 6379

SET name Vivek

GET name

Vivek

If you can explain:

- How the socket accepted the connection
- How bytes became a command
- How the command reached storage
- How the response got back

Then you've built the foundation of a real networked datastore.
