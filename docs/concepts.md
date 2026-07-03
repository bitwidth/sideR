Whole Ref Doc Written by `bitwidth`

## Boilerplate
### What problem does this solve?
### Why is it needed?
### What alternatives exist?
### What are the tradeoffs?

---
<details>
<summary>
 TCP
</summary>

## What problem does this solve?
Two programs
A - 
B -
How do they communicate to each other and reliably
And its stream of bytes - not a packets or whatever it is

## Why is it needed?
To fix the issue of communication between 2 systems reliably

## What alternatives exist?
Not sure - Havent looked
Looked
UDP - Simple lightweight really fast
HTTP - Easy to understand
WebSockets

## What are the tradeoffs?
TCP - provides really reliable, ordered, retransmission, connection oriented protocol
So if something is missed (packet loss) - it will handle it itself
All this reliability costs - More overhead
More latency
More memory
More protocol complexity

UDP - is much simpler 
Very fast
Very lightweight
Low latency
Must handle: Packet loss, Ordering, Retries ourselves.

HTTP - huge overhead
We only want quick reliable enough comm

WebSockets - provides messages than bytes while TCP - bytes
Pros
Simpler message handling
Browser support
Cons
Extra protocol layer
Not how real Redis works
</details>

---

<details>

<summary>
Client vs Servers
</summary>

## What problem does this solve?
Program A
Program B
Someone has to wait for incoming connections (server)
Someone has to initiate connections (client)

## Why is it needed?
Because these are roles that the programs must assume to communicate

## What alternatives exist?
Peer to Peer - No one is server - Nodes act as both client and server
Message queue -> Producer - Queue - Consumer
Publish subscribe -> Publisher - Channel - Subscriber ()
Shared storage -> Process A - storage - Process B (no one talks to anyone)
Actor Model -> Actor A - Message - Actor B (Erlang - Highly useful for concurrency)


## What are the tradeoffs?
Client/server is simpler and easier to reason about, but introduces centralization and potential bottlenecks.

P2P
Pros:
No central dependency
Highly scalable
Cons:
Much harder to build
Discovery becomes difficult
Question:
If nobody is a server, how do you find another peer?
That's one of the big P2P problems.

Message Queue
Pros:
Decoupling
Reliability
Cons:
More moving pieces

</details>

---

<details>
<summary> IP Address </summary>

### What problem does this solve?
How do I know where my server is at?\
I have a laptop - where do I go to connect and start communicating?\
How do computers find each other on a network?

### Why is it needed?
You need an address.

House
→ Street Address

Person
→ Phone Number

IP Address = Machine Address

This machine runs:

Redis
PostgreSQL
NGINX
SSH

All on the same machine.

Which one do you want?
Need another level of addressing.

That's where ports come in.

192.168.1.100:6379

Machine:
192.168.1.100

Service:
Port 6379

Humans don't like:

142.250.183.46

We prefer:

google.com

DNS translates:

google.com
↓
IP Address

Like a phone contacts list.\
Assign each machine a unique address (IP).

### What alternatives exist?
Hostnames (DNS)\
Service discovery\
Broadcast discovery\
Peer discovery\
IPs are simple and efficient but not human-friendly and can change.

### What are the tradeoffs?
Nothing really - Couldnt and didnt bother

</details>

---

<details>
<summary> Port </summary>

### What problem does this solve?
IP tells which machine\
We need to know which application as well on the machine\
Imagine an apartment building - okay cools we got that - but now which apartment number?\

### Why is it needed?
To fix the issue of the application on machine\
There is small caveat though\
Ports belong to sockets, not applications

Client doesn't choose a port usually - OS decides - but for server it should be known - so it is chosen -
Ephemeral Ports (temporary ports)

One port doesnt mean one connection = Imagine front door - Many clients can enter through the same door.
### What alternatives exist?
### What are the tradeoffs?

</details>

---

<details>
<summary> 
Connection lifecycle
</summary>

### What problem does this solve?
Suppose:

Redis running

and

Client wants data

Question:
how do you go from strangers to connected?

### Why is it needed?
1. Server starts
2. Server listens
3. Client connects\
  Client:50001\
      ↕\
Redis:6379

    The OS creates connection state.\
    Redis receives a new socket.\
    This is important.\
    Redis now has:\
    Listening Socket\
    and\
    Client Socket\
    These are different things.
4. Connection established
5. Data exchanged
6. Connection closed
### What alternatives exist?

### What are the tradeoffs?

<details>
<summary>
Important notes for `bitwidth`
</summary>

# Listening Socket vs Client Socket

## Question

What does it mean when Redis "receives a new socket"?

## Mental Model

Think of a restaurant.

```text
Restaurant
    ↓
Front Door
    ↓
Tables
```

The front door:

```text
Listening Socket
```

The tables:

```text
Client Sockets
```

People enter through the door.

They don't eat at the door.

They get seated at a table.

Similarly:

```text
Client connects
↓
Listening Socket accepts connection
↓
OS creates Client Socket
↓
Redis receives Client Socket
```

Redis continues using:

```text
Client Socket
```

for communication.

The listening socket remains available for future clients.

---

## Why not reuse the Listening Socket?

Because its job is:

```text
Accept new clients
```

not:

```text
Exchange application data
```

If Redis used the listening socket for communication:

```text
Client A connects
↓
Listening Socket occupied
↓
Client B cannot connect
```

---

# Who Creates the Client Socket?

## Question

Redis didn't create the connection.

The OS did.

So who creates the new socket?

## Mental Model

Redis asks:

```text
Listen on port 6379
```

The OS owns networking.

When a client connects:

```text
Client OS
        ↔
Server OS
```

perform the TCP handshake.

The server OS then says:

```text
A connection was established.
Here is a socket representing it.
```

Conceptually:

```text
Redis
  ↓
Listening Socket

Client Connects

OS
  ↓
Creates Connected Socket

Redis
  ↓
Receives Connected Socket
```

Redis never manually creates the incoming client socket.

The OS does.

---

# Does Data Travel Through Sockets?

## Question

When data exchange happens, does it happen over sockets?

## Answer

Yes.

Applications interact with sockets.

Sockets interact with the OS.

The OS moves bytes over the network.

---

## Mental Model

Think of a socket as a pipe endpoint.

```text
Client Socket
      ||
      ||
      ||
Server Socket
```

Client writes:

```text
SET name Vivek
```

to its socket.

Server reads:

```text
SET name Vivek
```

from its socket.

Redis writes:

```text
OK
```

back to its socket.

Client reads:

```text
OK
```

from its socket.

---

# Is Communication Bidirectional?

## Answer

Yes.

TCP is:

```text
Full Duplex
```

Meaning:

```text
Client → Server
Server → Client
```

can happen simultaneously.

---

## Mental Model

Like a phone call.

Both sides can speak.

Both sides can listen.

At the same time.

---

# What Happens When a Connection Closes?

## Question

Which socket disappears?

Client?

Server?

Both?

## Answer

Both connected sockets disappear.

The listening socket survives.

---

## Mental Model

Before:

```text
Listening Socket

Client Socket A ↔ Server Socket A
Client Socket B ↔ Server Socket B
```

Client A disconnects:

```text
Listening Socket

Client Socket A ❌
Server Socket A ❌

Client Socket B ↔ Server Socket B
```

The listening socket remains.

Redis can still accept new clients.

---

# Connection vs Socket

## Question

Are they the same thing?

## Answer

No.

They are related but different.

---

## Mental Model 1: Phone Call

```text
Connection
=
Phone Call

Socket
=
Phone Device
```

The call exists between two phones.

Each phone has its own device.

---

## Mental Model 2: Tunnel

```text
Connection
=
Tunnel

Socket
=
Tunnel Entrance
```

The tunnel exists between two places.

Each side has an entrance.

---

## Practical View

A TCP connection exists between:

```text
Client
and
Server
```

The operating systems maintain it.

Applications receive sockets representing their endpoint.

Conceptually:

```text
Client Socket
        ↕
TCP Connection
        ↕
Server Socket
```

---

# Why Doesn't Redis Respond Using IP Addresses Directly?

## Question

If Redis knows the client's IP and port, why not respond using those?

## Answer

Because Redis already has the socket.

The socket already knows:

```text
Source IP
Source Port
Destination IP
Destination Port
```

Redis simply writes:

```text
socket.write(...)
```

The OS handles delivery.

---

## Mental Model

Instead of:

```text
Write letter
Find address
Deliver letter
```

Redis does:

```text
Speak into phone
```

The phone system already knows who is on the other end.

---

# One Connection = One Socket?

## Common Misconception

```text
Connection = Socket
```

Not quite.

More accurately:

```text
Connection
=
Relationship

Socket
=
Handle to that relationship
```

---

# Key Takeaway

For a Redis-like server:

```text
Listening Socket
        ↓
Accept Connection
        ↓
Connected Socket
        ↓
Read Bytes
        ↓
Process Command
        ↓
Write Bytes
        ↓
Close Connection
```

That's the fundamental lifecycle that almost every TCP server follows.

---

# Personal Summary

A listening socket is like a front desk.

Connected sockets are like individual conversations.

The OS owns networking and creates connected sockets when clients connect.

Applications interact with sockets, not raw TCP packets.

A TCP connection is the communication channel.

Sockets are the endpoints used to interact with that channel.

</details>

---

</details>
<summary>

</summary>

</details>

---
