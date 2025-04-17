const assert = require("assert");
const { Server } = require("ws");
const ShareDB = require("sharedb");
const WebSocketJSONStream = require("@teamwork/websocket-json-stream");
const PostgresDB = require("./sharedb-postgresql");
const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');

const ONE_MINUTE_IN_MS = 60 * 1000;
const TOKEN_EXPIRY_CODE = 4001;

const { PORT = 8000, API_URL_EXT, PG_URL } = process.env;
assert(API_URL_EXT);
assert(PG_URL);

const sharedb = new ShareDB({
  db: new PostgresDB({
    connectionString: PG_URL,
    ssl: false,
  }),
});

// Setup JSDOM and DOMPurify
const window = new JSDOM("").window;
const DOMPurify = createDOMPurify(window);

// Register middleware hooks

// Get userId from request on initial connection, register to agent
sharedb.use("connect", (context, next) => {
  try {
    context.agent.connectSession = { userId: context.req.uId.sub };
  } catch (e) {
    console.error("Error connecting to ShareDB: ", e);
  };
  next();
});

// Assign userId to op metadata when commit hook fires
// This allows us to access this value at the db level
sharedb.use("commit", (context, done) => {
  try {
    const { op, agent } = context;
    op.m.uId = agent.connectSession.userId;
    op.op = op.op.map(sanitiseOperation);
  } catch (e) {
    console.error("Error committing to ShareDB: ", e);
  };
  done();
});

/**
 * @description Sanitise operations which insert or update nodes
 */
function sanitiseOperation(op) {
  const isInsertOrUpdate = "oi" in op;
  if (isInsertOrUpdate) {
    op.oi = sanitise(op.oi);
  };
  return op;
}

/**
 * @description Recursively traverse updated data in order to find string values, and then sanitise these by calling DOMPurify. Input could be an entire node, or a single property of a node, depending on the operation.
 */
function sanitise(input) {
  if ((input && typeof input === "string") || input instanceof String) {
    return DOMPurify.sanitize(input, { ADD_ATTR: ["target"] });
  } else if ((input && typeof input === "object") || input instanceof Object) {
    return Object.entries(input).reduce((acc, [k, v]) => {
      v = sanitise(v);
      acc[k] = v;
      return acc;
    }, input);
  } else {
    return input;
  }
}

/**
 * Checks via REST API if token is invalid (not signed by PlanX) or revoked (logged out user)
 */
async function validateJWT(authToken) {
  const response = await fetch(`${API_URL_EXT}/auth/validate-jwt`, {
    method: "GET",
    headers: {
      authorization: `Bearer ${authToken}`
    }
  });

  if (response.ok) {
    const decodedToken = await response.json();
    return decodedToken;
  }

  throw Error("Invalid JWT. Please log in again.");
};

const wss = new Server({
  port: PORT,
  verifyClient: async (info, cb) => {
    try {
      // checks if JWT is included in cookies, does not allow connection if invalid
      const [, token] = info.req.headers.cookie?.match(/jwt\=([^;]+)/) || [];
      if (!token) return cb(false, 401, "Unauthorized");
      const decoded = await validateJWT(token);

      console.log({ newConnection: decoded });
      info.req.uId = decoded;
      info.req.authToken = token;
      cb(true);
    } catch (err) {
      console.error({ err });
      cb(false, 401, `Unauthorized. Error: ${err.message}`);
    }
  },
});

wss.on("connection", function (ws, req) {
  // JWTs expire every 24hrs
  // Check status every minute - client side will logout on expiry
  const tokenCheckInterval = setInterval(async () => {
    try {
      await validateJWT(req.authToken)
    } catch (error) {
      console.error("Token validation error:", error);
      ws.close(TOKEN_EXPIRY_CODE, "Token validation error");
      clearInterval(tokenCheckInterval);
    }
  }, ONE_MINUTE_IN_MS);

  const stream = new WebSocketJSONStream(ws);
  sharedb.listen(stream, req);
});

console.info(`sharedb listening ws://localhost:${PORT}`);
