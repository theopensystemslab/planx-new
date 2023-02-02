import "isomorphic-fetch";
import { json, urlencoded } from "body-parser";
import assert from "assert";
import cookieParser from "cookie-parser";
import cookieSession from "cookie-session";
import cors from "cors";
import { stringify } from "csv-stringify";
import express, { CookieOptions, ErrorRequestHandler, Response } from "express";
import { expressjwt, Request } from "express-jwt";
import noir from "pino-noir";
import pinoLogger from "express-pino-logger";
import { URL } from "url";
import { Server } from "http";
import passport from "passport";
import { sign } from "jsonwebtoken";
import {
  Strategy as GoogleStrategy,
  Profile,
  VerifyCallback,
} from "passport-google-oauth20";
import { responseInterceptor } from "http-proxy-middleware";
import helmet from "helmet";
import multer from "multer";
import SlackNotify from "slack-notify";

import { locationSearch } from "./gis/index";
import { diffFlow, publishFlow } from "./editor/publish";
import { findAndReplaceInFlow } from "./editor/findReplace";
import { copyPortalAsFlow } from "./editor/copyPortalAsFlow";
import {
  resumeApplication,
  validateSession,
  sendSaveAndReturnEmail,
} from "./saveAndReturn";
import { useFilePermission, useHasuraAuth, useSendEmailAuth } from "./auth";

import airbrake from "./airbrake";
import {
  createReminderEvent,
  createExpiryEvent,
} from "./webhooks/lowcalSessionEvents";
import { adminGraphQLClient, publicGraphQLClient } from "./hasura";
import { graphQLVoyagerHandler, introspectionHandler } from "./hasura/voyager";
import { sendEmailLimiter, apiLimiter } from "./rateLimit";
import {
  privateDownloadController,
  privateUploadController,
  publicDownloadController,
  publicUploadController,
} from "./s3";
import { sendToBOPS } from "./send/bops";
import { createSendEvents } from "./send/createSendEvents";
import { downloadApplicationFiles, sendToEmail } from "./send/email";
import { sendToUniform } from "./send/uniform";
import { sendSlackNotification } from "./webhooks/sendNotifications";
import { copyFlow } from "./editor/copyFlow";
import { moveFlow } from "./editor/moveFlow";
import { useOrdnanceSurveyProxy } from "./proxy/ordnanceSurvey";
import { usePayProxy } from "./proxy/pay";
import { downloadFeedbackCSV } from "./admin/feedback/downloadFeedbackCSV";
import { sanitiseApplicationData } from "./webhooks/sanitiseApplicationData";
import { isLiveEnv } from "./helpers";
import { logPaymentStatus } from "./send/helpers";

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
  req.logout(() => {
    // do nothing
  });
  res.redirect(process.env.EDITOR_URL_EXT!);
});

// GET /google

//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Google authentication will involve
//   redirecting the user to google.com.  After authorization, Google
//   will redirect the user back to this application at /auth/google/callback

const handleSuccess = (req: Request, res: Response) => {
  if (req.user) {
    const { returnTo = process.env.EDITOR_URL_EXT } = req.session!;

    const domain = (() => {
      if (isLiveEnv()) {
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
      const cookie: CookieOptions = {
        domain,
        maxAge: new Date(
          new Date().setFullYear(new Date().getFullYear() + 1)
        ).getTime(),
        httpOnly: false,
      };

      if (isLiveEnv()) {
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
  req.session!.returnTo = req.get("Referrer");
  return passport.authenticate("google", {
    scope: ["profile", "email"],
  })(req, res, next);
});

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/auth/login/failed" }),
  handleSuccess
);

const client = adminGraphQLClient;

const buildJWT = async (profile: Profile, done: VerifyCallback) => {
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
      jwt: sign(data, process.env.JWT_SECRET!),
    });
  } else {
    done({
      status: 404,
      message: `User (${email}) not found. Do you need to log in to a different Google Account?`,
    } as any);
  }
};

passport.use(
  "google",
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
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

passport.deserializeUser(function (obj: Express.User, cb) {
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

app.use(json({ limit: "100mb" }));

// Converts req.headers.cookie: string, to req.cookies: Record<string, string>
app.use(cookieParser());

// XXX: Currently not checking for JWT and including req.user in every
//      express endpoint because authentication also uses req.user. More info:
//      https://github.com/theopensystemslab/planx-new/pull/555#issue-684435760
// TODO: requestProperty can now be set. This might resolve the above issue.
const useJWT = expressjwt({
  secret: process.env.JWT_SECRET!,
  algorithms: ["HS256"],
  credentialsRequired: true,
  requestProperty: "user",
  getToken: (req) =>
    req.cookies?.jwt ??
    req.headers.authorization?.match(/^Bearer (\S+)$/)?.[1] ??
    req.query?.token,
});

if (process.env.NODE_ENV !== "test") {
  app.use(
    pinoLogger({
      serializers: noir(["req.headers.authorization"], "**REDACTED**"),
    })
  );
}

// Rate limit requests per IP address
app.use(apiLimiter);

// Secure Express by setting various HTTP headers
app.use(helmet());

// Create "One-off Scheduled Events" in Hasura from Send component for selected destinations
app.post("/create-send-events/:sessionId", createSendEvents);

assert(process.env.HASURA_PLANX_API_KEY);

assert(process.env.BOPS_API_ROOT_DOMAIN);
assert(process.env.BOPS_API_TOKEN);
app.post("/bops/:localAuthority", useHasuraAuth, sendToBOPS);

assert(process.env.UNIFORM_TOKEN_URL);
assert(process.env.UNIFORM_SUBMISSION_URL);
app.post("/uniform/:localAuthority", useHasuraAuth, sendToUniform);

app.post("/email-submission/:localAuthority", useHasuraAuth, sendToEmail);

app.get("/download-application-files/:sessionId", downloadApplicationFiles);

["BUCKINGHAMSHIRE", "LAMBETH", "SOUTHWARK"].forEach((authority) => {
  assert(process.env[`GOV_UK_PAY_TOKEN_${authority}`]);
});

// used by startNewPayment() in @planx/components/Pay/Public/Pay.tsx
// returns the url to make a gov uk payment
app.post("/pay/:localAuthority", (req, res, next) => {
  // confirm that this local authority (aka team) has a pay token configured before creating the proxy
  const isSupported =
    process.env[`GOV_UK_PAY_TOKEN_${req.params.localAuthority.toUpperCase()}`];

  const flowId = req.query?.flowId as string | undefined;
  const sessionId = req.query?.sessionId as string | undefined;
  const teamSlug = req.params.localAuthority;

  if (isSupported) {
    // drop req.params.localAuthority from the path when redirecting
    // so redirects to plain [GOV_UK_PAY_URL] with correct bearer token
    usePayProxy(
      {
        pathRewrite: (path) => path.replace(/^\/pay.*$/, ""),
        selfHandleResponse: true,
        onProxyRes: responseInterceptor(
          async (responseBuffer, _proxyRes, _req, _res) => {
            const responseString = responseBuffer.toString("utf8");
            const govUkResponse = JSON.parse(responseString);
            await logPaymentStatus({
              sessionId,
              flowId,
              teamSlug,
              govUkResponse,
            });
            return JSON.stringify(govUkResponse);
            return responseBuffer;
          }
        ),
      },
      req
    )(req, res, next);
  } else {
    next({
      status: 400,
      message: `GOV.UK Pay is not enabled for this local authority`,
    });
  }
});

assert(process.env.SLACK_WEBHOOK_URL);

// used by refetchPayment() in @planx/components/Pay/Public/Pay.tsx
// fetches the status of the payment
app.get("/pay/:localAuthority/:paymentId", (req, res, next) => {
  const flowId = req.query?.flowId as string | undefined;
  const sessionId = req.query?.sessionId as string | undefined;
  const teamSlug = req.params.localAuthority;

  // will redirect to [GOV_UK_PAY_URL]/:paymentId with correct bearer token
  usePayProxy(
    {
      pathRewrite: () => `/${req.params.paymentId}`,
      selfHandleResponse: true,
      onProxyRes: responseInterceptor(async (responseBuffer) => {
        const govUkResponse = JSON.parse(responseBuffer.toString("utf8"));

        await logPaymentStatus({
          sessionId,
          flowId,
          teamSlug,
          govUkResponse,
        });

        // if it's a prod payment, notify #planx-notifications so we can monitor for subsequent submissions
        if (govUkResponse?.payment_provider !== "sandbox") {
          try {
            const slack = SlackNotify(process.env.SLACK_WEBHOOK_URL!);
            const getStatus = (state: Record<string, string>) =>
              state.status + (state.message ? ` (${state.message})` : "");
            const payMessage = `:coin: New GOV Pay payment *${
              govUkResponse.payment_id
            }* with status *${getStatus(govUkResponse.state)}* [${
              req.params.localAuthority
            }]`;
            await slack.send(payMessage);
            console.log("Payment notification posted to Slack");
          } catch (error) {
            next(error);
            return "";
          }
        }

        // only return payment status, filter out PII
        return JSON.stringify({
          payment_id: govUkResponse.payment_id,
          amount: govUkResponse.amount,
          state: govUkResponse.state,
        });
      }),
    },
    req
  )(req, res, next);
});

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
      { id: req.user?.sub }
    );

    if (!user.users_by_pk)
      next({ status: 404, message: `User (${req.user?.sub}) not found` });

    res.json(user.users_by_pk);
  } catch (err) {
    next(err);
  }
});

app.get("/gis", (_req, res, next) => {
  next({
    status: 400,
    message: "Please specify a local authority",
  });
});

app.get("/gis/:localAuthority", locationSearch);

app.get("/", (_req, res) => {
  res.json({ hello: "world" });
});

app.get("/admin/feedback", useJWT, downloadFeedbackCSV);

// XXX: leaving this in temporarily as a testing endpoint to ensure it
//      works correctly in staging and production
app.get("/throw-error", () => {
  throw new Error("custom error");
});

app.all(
  "/introspect",
  introspectionHandler({
    graphQLClient: publicGraphQLClient,
    validateUser: false,
  })
);
app.get(
  "/introspect/graph",
  graphQLVoyagerHandler({ graphQLURL: "/introspect", validateUser: false })
);
app.all(
  "/introspect-all",
  useJWT,
  introspectionHandler({
    graphQLClient: adminGraphQLClient,
    validateUser: true,
  })
);
app.get(
  "/introspect-all/graph",
  useJWT,
  graphQLVoyagerHandler({ graphQLURL: "/introspect-all", validateUser: true })
);

app.post("/flows/:flowId/copy", useJWT, copyFlow);

app.post("/flows/:flowId/diff", useJWT, diffFlow);

app.post("/flows/:flowId/move/:teamSlug", useJWT, moveFlow);

app.post("/flows/:flowId/publish", useJWT, publishFlow);

// use with query params `find` (required) and `replace` (optional)
app.post("/flows/:flowId/search", useJWT, findAndReplaceInFlow);

app.get("/flows/:flowId/copy-portal/:portalNodeId", useJWT, copyPortalAsFlow);

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
      message: "Missing application `data` to download",
    });
  }

  try {
    // build a CSV and stream the response
    stringify(req.body, {
      columns: ["question", "responses", "metadata"],
      header: true,
    }).pipe(res);
    res.header("Content-type", "text/csv");
  } catch (err) {
    next(err);
  }
});

app.post(
  "/private-file-upload",
  multer().single("file"),
  privateUploadController
);

app.post(
  "/public-file-upload",
  multer().single("file"),
  publicUploadController
);

app.get("/file/public/:fileKey/:fileName", publicDownloadController);

app.get(
  "/file/private/:fileKey/:fileName",
  useFilePermission,
  privateDownloadController
);

const trackAnalyticsLogExit = async (id: number, isUserExit: boolean) => {
  try {
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
  } catch (e) {
    // We need to catch this exception here otherwise the exception would become an unhandle rejection which brings down the whole node.js process
    console.error(
      "There's been an error while recording metrics for analytics but because this thread is non-blocking we didn't reject the request",
      (e as Error).stack
    );
  }

  return;
};

app.post("/analytics/log-user-exit", async (req, res, next) => {
  const analyticsLogId = Number(req.query.analyticsLogId);
  if (analyticsLogId > 0) trackAnalyticsLogExit(analyticsLogId, true);
  res.send();
});

app.post("/analytics/log-user-resume", async (req, res, next) => {
  const analyticsLogId = Number(req.query.analyticsLogId);
  if (analyticsLogId > 0) trackAnalyticsLogExit(analyticsLogId, false);
  res.send();
});

assert(process.env.GOVUK_NOTIFY_API_KEY);
app.post(
  "/send-email/:template",
  sendEmailLimiter,
  useSendEmailAuth,
  sendSaveAndReturnEmail
);
app.post("/resume-application", sendEmailLimiter, resumeApplication);
app.post("/validate-session", validateSession);

app.use("/webhooks/hasura", useHasuraAuth);
app.post("/webhooks/hasura/create-reminder-event", createReminderEvent);
app.post("/webhooks/hasura/create-expiry-event", createExpiryEvent);
app.post("/webhooks/hasura/send-slack-notification", sendSlackNotification);
app.post("/webhooks/hasura/sanitise-application-data", sanitiseApplicationData);

app.use("/proxy/ordnance-survey", useOrdnanceSurveyProxy);

app.get("/error", async (res, req, next) => {
  try {
    throw Error("This is a test error");
  } catch (error) {
    next(error);
  }
});

const errorHandler: ErrorRequestHandler = (errorObject, _req, res, _next) => {
  const { status = 500, message = "Something went wrong" } = (() => {
    if (errorObject instanceof Error && airbrake) {
      airbrake.notify(errorObject);
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
};

// Handle any server errors that were passed with next(err)
// Order is significant, this should be the final app.use()
app.use(errorHandler);

const server = new Server(app);

server.keepAliveTimeout = 30000; // 30s
server.headersTimeout = 35000; // 35s

export default server;

/* eslint-disable @typescript-eslint/no-namespace */
// declaring User in a d.ts file is overwritten by other files
declare global {
  namespace Express {
    interface User {
      jwt: string;
      sub?: string;
    }
  }
}
