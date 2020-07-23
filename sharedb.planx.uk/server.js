const { Server } = require("ws");
const jwt = require("jsonwebtoken");
const ShareDB = require("sharedb");
const WebSocketJSONStream = require("@teamwork/websocket-json-stream");

const { PORT = 8000, JWT_SECRET = "shh" } = process.env;

const backend = new ShareDB();

function startServer() {
  const wss = new Server({
    port: PORT,
    verifyClient: (info, cb) => {
      // checks if JWT is included in cookies, does not allow connection if invalid
      const [, token] = info.req.headers.cookie.match(/Authorization\=([^;]+)/);

      if (!token) {
        cb(false, 401, "Unauthorized");
      } else {
        jwt.verify(token, JWT_SECRET, (err, decoded) => {
          if (err) {
            cb(false, 401, "Unauthorized");
          } else {
            console.log({ newConnection: decoded });
            info.req.user = decoded;
            cb(true);
          }
        });
      }
    },
  });

  wss.on("connection", function (ws, req) {
    const stream = new WebSocketJSONStream(ws);
    backend.listen(stream, req.user);
  });

  console.info(`sharedb listening ws://localhost:${PORT}`);
}

startServer();
