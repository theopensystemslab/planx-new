const { readFileSync } = require("fs");
const WebSocketJSONStream = require("@teamwork/websocket-json-stream");
const ShareDB = require("sharedb");
const { Server } = require("ws");

const [, PORT] = readFileSync("./.env.test")
  .toString()
  .match(/SHAREDB_URL=.+:(\d+)/);

let ws;
const sharedb = new ShareDB();
ws = new Server({
  port: Number(PORT),
});

ws.on("connection", (ws) => {
  sharedb.listen(new WebSocketJSONStream(ws));
});

console.log(`sharedb test server running on ws://localhost:${PORT}`);
