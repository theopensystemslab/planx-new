const { Server } = require("ws");
const jwt = require("jsonwebtoken");
const ShareDB = require("sharedb");
const WebSocketJSONStream = require("@teamwork/websocket-json-stream");
const { PostgresDB, PERMITTED_TABLES } = require("./sharedb-postgresql");
const access = require("sharedb-access");

console.log({ PERMITTED_TABLES });

const { PORT = 8000, JWT_SECRET = "shh", PG_URL = "" } = process.env;

const sharedb = new ShareDB({
  db: new PostgresDB({
    connectionString: PG_URL,
    ssl: false,
  }),
});

sharedb.use("connect", (request, next) => {
  try {
    request.agent.connectSession = { userId: request.req.uId.sub };
  } catch (e) {}
  next();
});

access(sharedb);

// TODO: make this useful!
PERMITTED_TABLES.forEach((table) => {
  sharedb.allowCreate(table, async (docId, doc, session) => true);
  sharedb.allowRead(table, async (docId, doc, session) => true);
  sharedb.allowUpdate(table, async (docId, doc, session) => true);
  sharedb.allowDelete(table, async (docId, doc, session) => true);
});

const wss = new Server({
  port: PORT,
  verifyClient: (info, cb) => {
    try {
      // checks if JWT is included in cookies, does not allow connection if invalid
      const [, token] = info.req.headers.cookie.match(/jwt\=([^;]+)/);

      if (!token) {
        cb(false, 401, "Unauthorized");
      } else {
        jwt.verify(token, JWT_SECRET, (err, decoded) => {
          if (err) {
            cb(false, 401, "Unauthorized");
          } else {
            console.log({ newConnection: decoded });
            info.req.uId = decoded;
            cb(true);
          }
        });
      }
    } catch (err) {
      console.error({ err });
      cb(false, 500, err.message);
    }
  },
});

wss.on("connection", function (ws, req) {
  const stream = new WebSocketJSONStream(ws);
  sharedb.listen(stream, req);
});

console.info(`sharedb listening ws://localhost:${PORT}`);
