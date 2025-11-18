import type { Role } from "@opensystemslab/planx-core/types";
import assert from "assert";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cookieSession from "cookie-session";
import express from "express";
import { pinoHttp } from "pino-http";
import helmet from "helmet";
import { Server, type IncomingMessage } from "http";
import "isomorphic-fetch";
import { useSwaggerDocs } from "./docs/index.js";
import { errorHandler, expiredJWTHandler } from "./errors/requestHandlers.js";
import adminRoutes from "./modules/admin/routes.js";
import aiRoutes from "./modules/ai/routes.js";
import analyticsRoutes from "./modules/analytics/routes.js";
import getPassport from "./modules/auth/passport.js";
import getAuthRoutes from "./modules/auth/routes.js";
import fileRoutes from "./modules/file/routes.js";
import flowRoutes from "./modules/flows/routes.js";
import gisRoutes from "./modules/gis/routes.js";
import lpsRoutes from "./modules/lps/routes.js";
import miscRoutes from "./modules/misc/routes.js";
import ordnanceSurveyRoutes from "./modules/ordnanceSurvey/routes.js";
import payRoutes from "./modules/pay/routes.js";
import saveAndReturnRoutes from "./modules/saveAndReturn/routes.js";
import sendRoutes from "./modules/send/routes.js";
import sendEmailRoutes from "./modules/sendEmail/routes.js";
import slackRoutes from "./modules/slack/routes.js";
import teamRoutes from "./modules/team/routes.js";
import testRoutes from "./modules/test/routes.js";
import userRoutes from "./modules/user/routes.js";
import webhookRoutes from "./modules/webhooks/routes.js";
import { apiLimiter } from "./rateLimit.js";
import { registerSessionStubs } from "./session.js";
import { apiCors } from "./cors.js";

const app = express();

useSwaggerDocs(app);

app.set("trust proxy", 1);

app.use(apiCors);

app.use(bodyParser.json({ limit: "100mb" }));

// Converts req.headers.cookie: string, to req.cookies: Record<string, string>
app.use(cookieParser());

if (process.env.NODE_ENV !== "test") {
  app.use(
    pinoHttp({
      redact: {
        paths: ["req.headers.authorization"],
        censor: "**REDACTED**",
      },
      autoLogging: {
        ignore: (req) => {
          const isAWSHealthchecker =
            req.headers["user-agent"] === "ELB-HealthChecker/2.0";
          const isLocalDockerHealthchecker =
            req.headers["user-agent"] === "Wget" &&
            req.headers.host === "localhost:7002";
          const isJWTAuthRequest = req.url.startsWith("/auth/validate-jwt");

          return (
            isAWSHealthchecker || isLocalDockerHealthchecker || isJWTAuthRequest
          );
        },
      },
    }),
  );
}

// Rate limit requests per IP address
app.use(apiLimiter);

// Secure Express by setting various HTTP headers
app.use(helmet());

assert(process.env.GOVUK_NOTIFY_API_KEY);
assert(process.env.HASURA_PLANX_API_KEY);
assert(process.env.UNIFORM_TOKEN_URL);
assert(process.env.UNIFORM_SUBMISSION_URL);

// needed for storing original URL to redirect to in login flow
app.use(
  cookieSession({
    // we don't need session to persist for long - it's only required for auth flow
    maxAge: 2 * 60 * 60 * 1000, // 2hrs
    name: "session",
    secret: process.env.SESSION_SECRET,
  }),
);

// register stubs after cookieSession middleware initialisation
app.use(registerSessionStubs);

// equip passport with auth strategies early on, so we can pass it to route handlers
const passport = await getPassport();
app.use(passport.initialize());
app.use(passport.session());

app.use(bodyParser.urlencoded({ extended: true }));

// auth routes rely on the passport class we've just initialised
const authRoutes = await getAuthRoutes(passport);

// Setup API routes
app.use(adminRoutes);
app.use("/ai", aiRoutes);
app.use(analyticsRoutes);
app.use(authRoutes);
app.use(fileRoutes);
app.use(flowRoutes);
app.use(gisRoutes);
app.use(lpsRoutes);
app.use(miscRoutes);
app.use(ordnanceSurveyRoutes);
app.use(payRoutes);
app.use(saveAndReturnRoutes);
app.use(sendEmailRoutes);
app.use(sendRoutes);
app.use(slackRoutes);
app.use(teamRoutes);
app.use(testRoutes);
app.use(userRoutes);
app.use(webhookRoutes);

// Handle any server errors that were passed with next(err)
// Order is significant, these should be the final app.use()
app.use(expiredJWTHandler);
app.use(errorHandler);

const server = new Server(app);

server.keepAliveTimeout = 30000; // 30s
server.headersTimeout = 35000; // 35s
server.setTimeout(60 * 1000); // 60s

export default server;

/* eslint-disable @typescript-eslint/no-namespace */
// declaring User in a d.ts file is overwritten by other files
declare global {
  namespace Express {
    interface User {
      jwt: string;
      sub?: string;
      "https://hasura.io/jwt/claims"?: {
        "x-hasura-allowed-roles": Role[];
      };
    }
  }

  namespace Http {
    interface IncomingMessageWithCookies extends IncomingMessage {
      cookies?: {
        "ms-oidc-nonce": string;
      };
    }
  }
}
