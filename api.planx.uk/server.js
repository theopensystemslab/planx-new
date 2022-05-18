require("isomorphic-fetch");
const { json, urlencoded } = require("body-parser");
const assert = require("assert");
const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session");
const cors = require("cors");
const stringify = require("csv-stringify");
const express = require("express");
const jwt = require("express-jwt");
const noir = require("pino-noir");
const { URL } = require("url");
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
const { diffFlow, publishFlow } = require("./publish");
const { findAndReplaceInFlow } = require("./findReplace");
const { sendToUniform, downloadUniformZip } = require("./send");
const { resumeApplication, validateSession, sendSaveAndReturnEmail } = require("./saveAndReturn")

// debug, info, warn, error, silent
const LOG_LEVEL = process.env.NODE_ENV === "test" ? "silent" : "debug";

const airbrake = require("./airbrake");

const router = express.Router();

// when login failed, send failed msg
router.get("/login/failed", (_req, _res, next) => {
  next({
    status: 401,
    message: "user failed to authenticate.",
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
    const { returnTo = process.env.EDITOR_URL_EXT } = req.session;

    const domain = (() => {
      if (process.env.NODE_ENV === "production") {
        if (returnTo?.includes("editor.planx.")) {
          // user is logging in to staging from editor.planx.dev
          // or production from editor.planx.uk
          return `.${new URL(returnTo).host}`;
        } else {
          // user is logging in from either a netlify preview build,
          // or from localhost, to staging (or production... temporarily)
          return undefined;
        }
      } else {
        // user is logging in from localhost, to development
        return "localhost";
      }
    })();

    if (domain) {
      // As domain is set, we know that we're either redirecting back to
      // editor.planx.dev/login, editor.planx.uk, or localhost:PORT
      // (if this code is running in development). With the respective
      // domain set in the cookie.
      const cookie = {
        domain,
        maxAge: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        httpOnly: false,
      };

      if (process.env.NODE_ENV === "production") {
        cookie.secure = true;
        cookie.sameSite = "none";
      }

      res.cookie("jwt", req.user.jwt, cookie);

      res.redirect(returnTo);
    } else {
      // Redirect back to localhost:PORT/login (if this API is in staging or
      // production), or a netlify preview build url. As the login page is on a
      // different domain to whatever this API is running on, we can't set a
      // cookie. To solve this issue we inject the JWT into the return url as
      // a parameter that can be extracted by the frontend code instead.
      const url = new URL(returnTo);
      url.searchParams.set("jwt", req.user.jwt);
      res.redirect(url.href);
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

    done(null, {
      jwt: sign(data, process.env.JWT_SECRET),
    });
  } else {
    done({
      status: 404,
      message: `User (${email}) not found. Do you need to log in to a different Google Account?`,
    });
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

// Converts req.headers.cookie: string, to req.cookies: Record<string, string>
app.use(cookieParser());

// XXX: Currently not checking for JWT and including req.user in every
//      express endpoint because authentication also uses req.user. More info:
//      https://github.com/theopensystemslab/planx-new/pull/555#issue-684435760
const useJWT = jwt({
  secret: process.env.JWT_SECRET,
  algorithms: ["HS256"],
  credentialsRequired: true,
  getToken: (req) =>
    req.cookies?.jwt ??
    req.headers.authorization?.match(/^Bearer (\S+)$/)?.[1] ??
    req.query?.token,
});

if (process.env.NODE_ENV !== "test") {
  app.use(
    require("express-pino-logger")({
      serializers: noir(["req.headers.authorization"], "**REDACTED**"),
    })
  );
}

assert(process.env.BOPS_API_ROOT_DOMAIN);
assert(process.env.BOPS_API_TOKEN);
["BUCKINGHAMSHIRE", "LAMBETH", "SOUTHWARK"].forEach((authority) => {
  assert(process.env[`GOV_UK_PAY_TOKEN_${authority}`]);
});

app.post("/bops/:localAuthority", (req, res) => {
  // a local or staging API instance should send to the BOPS staging endpoint
  // production should send to the BOPS production endpoint
  const domain = `https://${req.params.localAuthority}.${process.env.BOPS_API_ROOT_DOMAIN}`;
  const target = `${domain}/api/v1/planning_applications`;

  useProxy({
    headers: {
      ...req.headers,
      Authorization: `Bearer ${process.env.BOPS_API_TOKEN}`,
    },
    pathRewrite: () => "",
    target,
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
            session_id: req.body?.planx_debug_data?.session_id,
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

app.post("/uniform/:localAuthority", sendToUniform);

// XXX: TEMPORARY ENDPOINT for interim testing until we can POST to Uniform FTP server
app.get("/uniform-download", downloadUniformZip);

// used by startNewPayment() in @planx/components/Pay/Public/Pay.tsx
// returns the url to make a gov uk payment
app.post("/pay/:localAuthority", (req, res) => {
  // drop req.params.localAuthority from the path when redirecting
  // so redirects to plain [GOV_UK_PAY_URL] with correct bearer token
  usePayProxy(
    {
      pathRewrite: (path) => path.replace(/^\/pay.*$/, ""),
    },
    req
  )(req, res);
});

// used by refetchPayment() in @planx/components/Pay/Public/Pay.tsx
// fetches the status of the payment
app.get("/pay/:localAuthority/:paymentId", (req, res, next) => {
  // will redirect to [GOV_UK_PAY_URL]/:paymentId with correct bearer token
  usePayProxy(
    {
      pathRewrite: () => `/${req.params.paymentId}`,
      selfHandleResponse: true,
      onProxyRes: responseInterceptor(async (responseBuffer) => {
        const govUkResponse = JSON.parse(responseBuffer.toString("utf8"));

        // only return payment status, filter out PII
        return JSON.stringify({
          payment_id: govUkResponse.payment_id,
          amount: govUkResponse.amount,
          state: govUkResponse.state,
        });
      }),
    },
    req
  )(req, res);
});

app.use(
  "/notify/*",
  useProxy({
    pathRewrite: {
      "^/notify": "",
    },
    target: "https://api.notifications.service.gov.uk",
  })
);

// needed for storing original URL to redirect to in login flow
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

app.get("/hasura", async function (_req, res, next) {
  try {
    const data = await client.request(
      `query GetTeams {
        teams {
          id
        }
      }`
    );
    res.json(data);
  } catch (err) {
    next(err);
  }
});

app.get("/me", useJWT, async function (req, res, next) {
  // useJWT will return 401 if the JWT is missing or malformed
  if (!req.user?.sub)
    next({ status: 401, message: "User ID missing from JWT" });

  try {
    const user = await client.request(
      `query ($id: Int!) {
        users_by_pk(id: $id) {
          id
          first_name
          last_name
          email
          is_admin
          created_at
          updated_at
        }
      }`,
      { id: req.user.sub }
    );

    if (!user.users_by_pk)
      next({ status: 404, message: `User (${req.user.sub}) not found` });

    res.json(user.users_by_pk);
  } catch (err) {
    next(err);
  }
});

app.get("/gis", (_req, res, next) => {
  next({
    status: 400,
    message: "Please specify a Local Authority",
  });
});

app.get("/gis/:localAuthority", locationSearch());

app.get("/", (_req, res) => {
  res.json({ hello: "world" });
});

// XXX: leaving this in temporarily as a testing endpoint to ensure it
//      works correctly in staging and production
app.get("/throw-error", () => {
  throw new Error("custom error");
});

app.post("/flows/:flowId/diff", useJWT, diffFlow);

app.post("/flows/:flowId/publish", useJWT, publishFlow);

// use with query params `find` (required) and `replace` (optional)
app.post("/flows/:flowId/search", useJWT, findAndReplaceInFlow);

// unauthenticated because accessing flow schema only, no user data
app.get("/flows/:flowId/download-schema", async (req, res, next) => {
  try {
    const schema = await client.request(
      `
      query ($flow_id: String!) {
        get_flow_schema(args: {published_flow_id: $flow_id}) {
          node
          type
          text
          planx_variable
        }
      }`,
      { flow_id: req.params.flowId }
    );

    if (schema.get_flow_schema.length < 1) {
      next({
        status: 404,
        message:
          "Can't find a schema for this flow. Make sure it's published or try a different flow id.",
      });
    } else {
      // build a CSV and stream it
      stringify(schema.get_flow_schema, { header: true }).pipe(res);

      res.header("Content-type", "text/csv");
      res.attachment(`${req.params.flowId}.csv`);
    }
  } catch (err) {
    next(err);
  }
});

// allows an applicant to download their application data on the Confirmation page
app.post("/download-application", async (req, res, next) => {
  if (!req.body) {
    res.send({
      message: "Missing application `data` to download"
    });
  }
  
  try {
    // build a CSV and stream the response
    stringify(req.body, { columns: ["question", "responses", "metadata"], header: true }).pipe(res);
    res.header("Content-type", "text/csv");
  } catch (err) {
    next(err);
  }
});

app.post("/sign-s3-upload", async (req, res, next) => {
  if (!req.body.filename) next({ status: 422, message: "missing filename" });

  try {
    const { fileType, url, acl } = await signS3Upload(req.body.filename);

    res.json({
      upload_to: url,
      public_readonly_url_will_be: url.split("?")[0],
      file_type: fileType,
      acl,
    });
  } catch (err) {
    next(err);
  }
});

const trackAnalyticsLogExit = async (id, isUserExit) => {
  const result = await client.request(
    `
      mutation UpdateAnalyticsLogUserExit($id: bigint!, $user_exit: Boolean) {
        update_analytics_logs_by_pk(
          pk_columns: {id: $id},
          _set: {user_exit: $user_exit}
        ) {
          id
          user_exit
          analytics_id
        }
      }
    `,
    {
      id,
      user_exit: isUserExit,
    }
  );

  const analytics_id = result.update_analytics_logs_by_pk.analytics_id;
  await client.request(
    `
      mutation SetAnalyticsEndedDate($id: bigint!, $ended_at: timestamptz) {
        update_analytics_by_pk(pk_columns: {id: $id}, _set: {ended_at: $ended_at}) {
          id
        }
      }
    `,
    {
      id: analytics_id,
      ended_at: isUserExit ? new Date().toISOString() : null,
    }
  );

  return;
}

app.post("/analytics/log-user-exit", async (req, res, next) => {
  const analyticsLogId = Number(req.query.analyticsLogId);
  if(analyticsLogId > 0) trackAnalyticsLogExit(analyticsLogId, true);
  res.send();
});

app.post("/analytics/log-user-resume", async (req, res, next) => {
  const analyticsLogId = Number(req.query.analyticsLogId);
  if(analyticsLogId > 0) trackAnalyticsLogExit(analyticsLogId, false);
  res.send();
});

// assert(process.env.GOVUK_NOTIFY_API_KEY_TEAM);
// assert(process.env.GOVUK_NOTIFY_API_KEY_TEST);
app.post("/send-email", sendSaveAndReturnEmail);
app.post("/resume-application", resumeApplication);
app.post("/validate-session", validateSession);

// Handle any server errors that were passed with next(err)
// Order is significant, this should be the final app.use()
app.use(
  // XXX: including all 4 function params appears to be a requirement?
  function errorHandler(errorObject, _req, res, _next) {
    const { status = 500, message = "Something went wrong" } = (() => {
      if (errorObject.error && airbrake) {
        airbrake.notify(errorObject.error);
        return {
          ...errorObject,
          message: errorObject.message.concat(", this error has been logged"),
        };
      } else {
        return errorObject;
      }
    })();

    res.status(status).send({
      error: message,
    });
  }
);

const server = new Server(app);

function useProxy(options = {}) {
  return createProxyMiddleware({
    changeOrigin: true,
    logLevel: LOG_LEVEL,
    onError: (err, req, res, target) => {
      res.json({
        status: 500,
        message: "Something went wrong",
      });
    },
    ...options,
  });
}

function usePayProxy(options, req) {
  return useProxy({
    target: "https://publicapi.payments.service.gov.uk/v1/payments",
    onProxyReq: fixRequestBody,
    headers: {
      ...req.headers,
      Authorization: `Bearer ${
        process.env[
          `GOV_UK_PAY_TOKEN_${req.params.localAuthority}`.toUpperCase()
        ]
      }`,
    },
    ...options,
  });
}

module.exports = server;
