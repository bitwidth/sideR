# Redis Clone Learning Roadmap

> Goal: Learn systems engineering concepts by building a Redis-like server in TypeScript.
>
> Focus on understanding concepts first. Features are merely vehicles for learning.

---

# Phase 0 — Foundations

## 0.1 Understand TCP

Learn:
- What is TCP?
- Client vs Server
- IP Address
- Port
- Connection lifecycle
- Why TCP is a stream and not messages

Deliverable:
- Written notes explaining TCP in your own words

---

## 0.2 Explore Node TCP APIs

Learn:
- Node `net` module
- Server creation
- Socket events
- Connection events
- Data events
- Close/error events

Deliverable:
- Simple server accepting connections

---

## 0.3 Build Echo Server

Input:

hello

Output:

hello

Concepts:
- Socket reading
- Socket writing
- Connection handling

Deliverable:
- Working echo server

---

# Phase 1 — Command-Based Server

## 1.1 Define Protocol

Decide how commands look:

SET name Vivek
GET name

Questions:
- What ends a command?
- What is an invalid command?
- What do responses look like?

Deliverable:
- Protocol specification document

---

## 1.2 Parse Commands

Transform raw input into structured commands.

Example:

SET name Vivek

becomes:

command=SET
args=[name,Vivek]

Deliverable:
- Parser module

---

## 1.3 Handle Errors

Examples:
- Missing arguments
- Unknown commands
- Invalid syntax

Deliverable:
- Error response system

---

# Phase 2 — Storage Engine

## 2.1 In-Memory Store

Learn:
- Maps
- Key lookup
- Mutations

Commands:
- SET
- GET
- DEL

Deliverable:
- Working in-memory datastore

---

## 2.2 Separate Storage Layer

Architecture:

Server
→ Parser
→ Storage Engine

Deliverable:
- Storage independent from networking

---

## 2.3 Add Unit Tests

Test:
- SET
- GET
- DEL

Deliverable:
- Storage tests

---

# Phase 3 — Multi-Client Support

## 3.1 Multiple Connections

Support:
- Client A
- Client B
- Client C

Deliverable:
- Simultaneous connections

---

## 3.2 Shared State

Verify:

A: SET name Vivek

B: GET name

Returns:
Vivek

Deliverable:
- Shared datastore

---

## 3.3 Connection Lifecycle

Handle:
- Disconnects
- Reconnects
- Unexpected closes

Deliverable:
- Stable connection management

---

# Phase 4 — Additional Commands

## 4.1 EXISTS

Support:
EXISTS key

---

## 4.2 KEYS

Support:
KEYS

---

## 4.3 INCR

Support:
INCR counter

Concepts:
- Numeric validation
- Atomic updates

---

## 4.4 DECR

Support:
DECR counter

---

# Phase 5 — Expiration System

## 5.1 Design Expiration Model

Questions:
- Where is expiry stored?
- How are timestamps tracked?

Deliverable:
- Design notes

---

## 5.2 Add TTL Support

Support:

SET session abc EX 60

---

## 5.3 Expiration Cleanup

Research:
- Lazy cleanup
- Background cleanup
- Hybrid approaches

Implement one.

---

## 5.4 TTL Command

Support:

TTL session

---

# Phase 6 — Persistence

## 6.1 Understand Persistence Strategies

Research:
- Snapshotting
- Append-only logs

Deliverable:
- Notes comparing approaches

---

## 6.2 Snapshot Save

Support:

SAVE

Write datastore to disk.

---

## 6.3 Startup Recovery

On startup:
- Load saved data
- Restore state

---

## 6.4 Corruption Handling

Questions:
- Missing file?
- Corrupted file?
- Partial writes?

---

# Phase 7 — Data Structures

## 7.1 Generic Value System

Move from:

Map<string,string>

To:

Map<string,Value>

---

## 7.2 Lists

Support:
- LPUSH
- RPUSH
- LRANGE

---

## 7.3 Sets

Support:
- SADD
- SREM
- SMEMBERS

---

## 7.4 Hashes

Support:
- HSET
- HGET
- HDEL

---

# Phase 8 — Pub/Sub

## 8.1 Design Channel Model

Questions:
- How are subscribers tracked?
- How are channels stored?

---

## 8.2 SUBSCRIBE

Support:

SUBSCRIBE chat

---

## 8.3 PUBLISH

Support:

PUBLISH chat hello

---

## 8.4 Multiple Subscribers

Test:
- One publisher
- Many subscribers

Concepts:
- Fan-out
- Event distribution

---

# Phase 9 — Observability

## 9.1 Logging

Track:
- Connections
- Commands
- Errors

---

## 9.2 Metrics

Track:
- Active connections
- Total commands
- Key count

---

## 9.3 INFO Command

Support:

INFO

Return runtime statistics.

---

# Phase 10 — Replication

## 10.1 Understand Replication

Research:
- Leader/Follower architecture
- State synchronization

Deliverable:
- Notes

---

## 10.2 Replica Connection

Replica connects to primary.

---

## 10.3 Change Propagation

Updates on primary are sent to replica.

---

## 10.4 Recovery

Handle:
- Replica reconnect
- Catch-up after downtime

---

# Phase 11 — Project Review

## 11.1 Architecture Review

Be able to explain:

- TCP
- Protocols
- Parsing
- Storage
- Persistence
- Pub/Sub
- Replication

Without looking anything up.

---

## 11.2 Refactor

Review:
- Coupling
- Module boundaries
- Naming
- Testability

---

## 11.3 Rewrite (Optional)

Only after completion:

TypeScript
→ Go

or

TypeScript
→ Rust

Purpose:
Learn the language, not Redis.

---

# Success Metric

Bad metric:
- Number of commands implemented

Good metric:
- Can explain the concepts behind the system
- Understand tradeoffs
- Can reason about failures and recovery
- Can design similar systems independently
