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
const {
  createProxyMiddleware,
  responseInterceptor,
  fixRequestBody,
} = require("http-proxy-middleware");

const { signS3Upload } = require("./s3");
const { locationSearch } = require("./gis/index");

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

const cookieDomain = (returnTo) => {
  if (process.env.NODE_ENV === "production") {
    // TODO: don't hardcode domain in here
    // this is either going to be a planx.uk or netlify.app domain
    if (returnTo && returnTo.includes("planx.uk")) {
      return ".planx.uk";
    }
  } else {
    return "localhost";
  }
};

const handleSuccess = (req, res) => {
  if (req.user) {
    const { returnTo = process.env.EDITOR_URL_EXT } = req.session;

    const domain = cookieDomain(returnTo);

    const cookie = {
      domain: domain || ".planx.uk",
      maxAge: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      httpOnly: false,
    };

    // TODO: remove this conditional, improve the cookieDomain fn
    if (process.env.NODE_ENV === "production") {
      cookie.secure = true;
      cookie.sameSite = "none";
    }

    res.cookie("jwt", req.user.jwt, cookie);

    if (domain) {
      res.redirect(returnTo);
    } else {
      // TODO:  build the url correctly with URLSearchParams, this
      //        assumes the existing url doesn't have any search params.
      res.redirect([returnTo, req.user.jwt].join("?jwt="));
    }
  } else {
    res.json({
      message: "no user",
      success: true,
    });
  }
};

router.get("/google", (req, res, next) => {
  req.session.returnTo = req.get("Referrer");
  return passport.authenticate("google", {
    scope: ["profile", "email"],
  })(req, res, next);
});

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
  })
);

app.use(
  json({
    extended: true,
    limit: "100mb",
  })
);

if (!process.env.BOPS_API_TOKEN) {
  console.error("Missing BOPS_API_TOKEN");
  process.exit(1);
} else if (!process.env.GOV_UK_PAY_TOKEN) {
  console.error("Missing GOV_UK_PAY_TOKEN");
  process.exit(1);
}

app.use("/bops/:localAuthority", (req, res) => {
  const target = `https://${req.params.localAuthority}.bops-staging.services/api/v1/planning_applications`;

  createProxyMiddleware({
    headers: {
      ...req.headers,
      Authorization: `Bearer ${process.env.BOPS_API_TOKEN}`,
    },
    pathRewrite: (path) => path.replace(/^\/bops.*$/, ""),
    target,
    changeOrigin: true,
    logLevel: "debug",
    selfHandleResponse: true,
    onProxyReq: fixRequestBody,
    onProxyRes: responseInterceptor(
      async (responseBuffer, proxyRes, req, res) => {
        const bopsResponse = JSON.parse(responseBuffer.toString("utf8"));

        const applicationId = await client.request(
          `
            mutation CreateApplication(
              $bops_id: String = "",
              $destination_url: String = "",
              $request: jsonb = "",
              $req_headers: jsonb = "",
              $response: jsonb = "",
              $response_headers: jsonb = "",
              $session_id: String = "",
            ) {
              insert_bops_applications_one(object: {
                bops_id: $bops_id,
                destination_url: $destination_url,
                request: $request,
                req_headers: $req_headers,
                response: $response,
                response_headers: $response_headers,
                session_id: $session_id,
              }) {
                id
              }
            }
          `,
          {
            bops_id: bopsResponse.id,
            destination_url: target,
            request: req.body,
            req_headers: req.headers,
            response: bopsResponse,
            response_headers: proxyRes.headers,
            session_id: req.body && req.body.sessionId,
          }
        );

        return JSON.stringify({
          application: {
            ...applicationId.insert_bops_applications_one,
            bopsResponse,
          },
        });
      }
    ),
  })(req, res);
});

app.use("/pay", (req, res) => {
  createProxyMiddleware({
    pathRewrite: {
      "^/pay": "",
    },
    target: "https://publicapi.payments.service.gov.uk/v1/payments",
    changeOrigin: true,
    logLevel: "debug",
    onProxyReq: fixRequestBody,
    headers: {
      ...req.headers,
      Authorization: `Bearer ${process.env.GOV_UK_PAY_TOKEN}`,
    },
  })(req, res);
});

app.use(
  "/notify/*",
  createProxyMiddleware({
    pathRewrite: {
      "^/notify": "",
    },
    target: "https://api.notifications.service.gov.uk",
    changeOrigin: true,
    logLevel: "debug",
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

app.use("/auth", router);

app.use("/gis", router);

app.get("/hasura", async function (req, res) {
  const data = await client.request(
    `query GetTeams {
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

app.get("/gis", (_req, res) => {
  res.json({
    message: "Please specify a Local Authority",
  });
});

app.get("/gis/:la", locationSearch());

app.get("/", (_req, res) => {
  res.json({ hello: "world" });
});

app.post("/sign-s3-upload", async (req, res) => {
  if (!req.body.filename) res.status(422).json({ error: "missing filename" });
  const { fileType, url, acl } = await signS3Upload(req.body.filename);
  try {
    res.json({
      upload_to: url,
      public_readonly_url_will_be: url.split("?")[0],
      file_type: fileType,
      acl,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error });
  }
});

const server = new Server(app);

module.exports = server;
