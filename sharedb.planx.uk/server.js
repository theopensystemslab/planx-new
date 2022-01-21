const assert = require("assert");
const { Server } = require("ws");
const jwt = require("jsonwebtoken");
const ShareDB = require("sharedb");
const WebSocketJSONStream = require("@teamwork/websocket-json-stream");
const PostgresDB = require("./sharedb-postgresql");

const { PORT = 8000, JWT_SECRET, PG_URL } = process.env;
assert(JWT_SECRET);
assert(PG_URL);

const sharedb = new ShareDB({
  db: new PostgresDB({
    connectionString: PG_URL,
    ssl: false,
  }),
});

// Register middleware hooks

// Get userId from request on initial connection, register to agent
sharedb.use("connect", (context, next) => {
  try {
    context.agent.connectSession = { userId: context.req.uId.sub };
  } catch (e) {};
  next();
});

// Assign userId to op metadata when commit hook fires
// This allows us to access this value at the db level
sharedb.use("commit", (context, done) => {
  try {
    const { op, agent } = context;
    op.m.uId = agent.connectSession.userId;
  } catch (e) {};
  done();
});

const wss = new Server({
  port: PORT,
  verifyClient: (info, cb) => {
    try {
      // checks if JWT is included in cookies, does not allow connection if invalid
      const [, token] = info.req.headers.cookie?.match(/jwt\=([^;]+)/) || [];

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
