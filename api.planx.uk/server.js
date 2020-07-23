const { json, urlencoded } = require("body-parser");
const cookieSession = require("cookie-session");
const cors = require("cors");
const express = require("express");
const jwt = require("express-jwt");
const request = require("graphql-request");
const { Server } = require("http");
const passport = require("passport");
require("./auth");
const authRoutes = require("./routes");

const PORT = process.env.PORT || 8001;

const app = express();

app.set("trust proxy", 1);

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin);
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.use(
  cors({
    credentials: true,
    methods: "*",
    origin: process.env.EDITOR_URL_EXT,
  })
);

app.use(
  cookieSession({
    maxAge: 24 * 60 * 60 * 100,
    name: "session",
    secret: process.env.SESSION_SECRET,
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(urlencoded({ extended: true }));

app.use(
  json({
    extended: true,
    limit: "100mb",
  })
);

app.use("/auth", authRoutes);

app.get("/hasura", async function (req, res) {
  const data = await request(
    process.env.HASURA_GRAPHQL_URL,
    `query {
      v1_teams {
        id
      }
    }`
  );
  res.json(data);
});

app.get("/me", jwt({ secret: process.env.JWT_SECRET }), async function (
  req,
  res
) {
  const user = await request(
    process.env.HASURA_GRAPHQL_URL,
    `query ($id: Int!) {
      v1_users_by_pk(id: $id) {
        id
        email
        created_at
      }
    }`,
    { id: req.user.id }
  );
  res.json(user.v1_users_by_pk);
});

app.get("/", (_req, res) => {
  res.json({ hello: "world" });
});

const server = new Server(app);

server.listen(PORT);

console.info(`api listening http://localhost:${PORT}`);
