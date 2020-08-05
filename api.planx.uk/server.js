require("isomorphic-fetch");
const { json, urlencoded } = require("body-parser");
const cookieSession = require("cookie-session");
const cors = require("cors");
const express = require("express");
const jwt = require("express-jwt");
const { GraphQLClient } = require("graphql-request");
const { Server } = require("http");
const passport = require("passport");
const { sign } = require("jsonwebtoken");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

const router = express.Router();

// when login failed, send failed msg
router.get("/login/failed", (_req, res) => {
  res.status(401).json({
    message: "user failed to authenticate.",
    success: false,
  });
});

// When logout, redirect to client
router.get("/logout", (req, res) => {
  req.logout();
  res.redirect(process.env.EDITOR_URL_EXT);
});

// GET /google

//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Google authentication will involve
//   redirecting the user to google.com.  After authorization, Google
//   will redirect the user back to this application at /auth/google/callback

const handleSuccess = (req, res) => {
  if (req.user) {
    const cookie = {
      // maxAge: 1000 * 60 * 10,
      // maxAge: new Date(253402300000000) ,
      // expires: false,

      // expire a year from now
      domain: req.hostname === "localhost" ? "localhost" : `.${req.hostname}`,
      maxAge: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      httpOnly: false,
    };
    res.cookie("jwt", req.user.jwt, cookie);
    console.log({ cookie });
    res.redirect(decodeURIComponent(process.env.EDITOR_URL_EXT));
    // const url = process.env.EDITOR_URL_EXT;
    // res.redirect(decodeURIComponent(`${url}#${req.user.jwt}`));
  } else {
    res.json({
      message: "no user",
      success: true,
    });
  }
};

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/auth/login/failed" }),
  handleSuccess
);

const client = new GraphQLClient(process.env.HASURA_GRAPHQL_URL, {
  headers: {
    "x-hasura-admin-secret": process.env.HASURA_GRAPHQL_ADMIN_SECRET,
  },
});

const buildJWT = async (profile, done) => {
  const { email } = profile._json;

  const { users } = await client.request(
    `
    query ($email: String!) {
      users(where: {email: {_eq: $email}}, limit: 1) {
        id
      }
    }`,
    { email }
  );

  if (users.length === 1) {
    const { id, is_admin = true } = users[0];

    const hasura = {
      "x-hasura-allowed-roles": ["editor"],
      "x-hasura-default-role": "editor",
      "x-hasura-user-id": id.toString(),
    };

    if (is_admin) {
      hasura["x-hasura-allowed-roles"] = ["admin"];
      hasura["x-hasura-default-role"] = "admin";
    }

    const data = {
      sub: id.toString(),
      // admin: is_admin,
      "https://hasura.io/jwt/claims": hasura,
    };

    console.log({ data });

    return done(null, {
      jwt: sign(data, process.env.JWT_SECRET),
    });
  } else {
    return done(new Error("User not found"));
  }
};

passport.use(
  "google",
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.API_URL_EXT}/auth/google/callback`,
    },
    async function (_accessToken, _refreshToken, profile, done) {
      await buildJWT(profile, done);
    }
  )
);

passport.serializeUser(function (user, cb) {
  cb(null, user);
});

passport.deserializeUser(function (obj, cb) {
  cb(null, obj);
});

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

app.use("/auth", router);

app.get("/hasura", async function (req, res) {
  const data = await request(
    process.env.HASURA_GRAPHQL_URL,
    `query {
      teams {
        id
      }
    }`
  );
  res.json(data);
});

app.get(
  "/me",
  jwt({ secret: process.env.JWT_SECRET, algorithms: ["HS256"] }),
  async function (req, res) {
    const user = await request(
      process.env.HASURA_GRAPHQL_URL,
      `query ($id: Int!) {
      users_by_pk(id: $id) {
        id
        email
        created_at
      }
    }`,
      { id: req.user.id }
    );
    res.json(user.users_by_pk);
  }
);

app.get("/", (_req, res) => {
  res.json({ hello: "world" });
});

const server = new Server(app);

server.listen(PORT);

console.info(`api listening http://localhost:${PORT}`);
