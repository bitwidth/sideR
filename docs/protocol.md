1. Where does a message start?
same like redis commands
2. Where does it end?
;\n (need to escape the \;\n)
3. What does the data mean?

4. How are errors represented?
;X\n
5. How do we evolve the protocol?
maybe for later but append ;v2\n or ;X\n



nah i cant
stealing from redis 


Protocol v1

Command Terminator:
;

Commands:
SET key value;
GET key;
DEL key;

Responses:
Follow Redis-style responses.

Errors:
Follow Redis-style errors where practical.