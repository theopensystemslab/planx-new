# sharedb.planx.uk

This is the websocket server for [sharedb](https://github.com/share/sharedb) which is used by planx to facilitate operational transforms on the flows.

Essentially this enables users to work collaboratively editing JSON that's stored in the database (`flows.data` in the SQL) without needing to request the entire JSON object every time it is updated.
