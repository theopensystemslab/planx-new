import "isomorphic-fetch";
import { json, urlencoded } from "body-parser";
import assert from "assert";
import cookieParser from "cookie-parser";
import cookieSession from "cookie-session";
import cors from "cors";
import { stringify } from "csv-stringify";
import express, { ErrorRequestHandler } from "express";
import noir from "pino-noir";
import pinoLogger from "express-pino-logger";
import { Server } from "http";
import passport from "passport";
import helmet from "helmet";

import { ServerError } from "./errors";
import { locationSearch } from "./gis/index";
import { makeInviteToPayPaymentViaProxy } from "./modules/pay/controller";
import {
  inviteToPay,
  fetchPaymentRequestDetails,
  buildPaymentPayload,
  fetchPaymentRequestViaProxy,
} from "./inviteToPay";
import { useHasuraAuth } from "./modules/auth/middleware";

import airbrake from "./airbrake";
import { apiLimiter } from "./rateLimit";
import { sendToBOPS } from "./send/bops";
import { createSendEvents } from "./send/createSendEvents";
import { downloadApplicationFiles, sendToEmail } from "./send/email";
import { sendToUniform } from "./send/uniform";
import { classifiedRoadsSearch } from "./gis/classifiedRoads";
import { googleStrategy } from "./modules/auth/strategy/google";
import authRoutes from "./modules/auth/routes";
import teamRoutes from "./modules/team/routes";
import miscRoutes from "./modules/misc/routes";
import userRoutes from "./modules/user/routes";
import webhookRoutes from "./modules/webhooks/routes";
import analyticsRoutes from "./modules/analytics/routes";
import adminRoutes from "./modules/admin/routes";
import flowRoutes from "./modules/flows/routes";
import ordnanceSurveyRoutes from "./modules/ordnanceSurvey/routes";
import saveAndReturnRoutes from "./modules/saveAndReturn/routes";
import sendEmailRoutes from "./modules/sendEmail/routes";
import fileRoutes from "./modules/file/routes";
import payRoutes from "./modules/pay/routes";
import { useSwaggerDocs } from "./docs";
import { Role } from "@opensystemslab/planx-core/types";

const router = express.Router();

const app = express();

useSwaggerDocs(app);

app.set("trust proxy", 1);

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin);
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept",
  );
  next();
});

app.use(
  cors({
    credentials: true,
    methods: "*",
  }),
);

app.use(json({ limit: "100mb" }));

// Converts req.headers.cookie: string, to req.cookies: Record<string, string>
app.use(cookieParser());

if (process.env.NODE_ENV !== "test") {
  app.use(
    pinoLogger({
      serializers: noir(["req.headers.authorization"], "**REDACTED**"),
    }),
  );
}

// Rate limit requests per IP address
app.use(apiLimiter);

// Secure Express by setting various HTTP headers
app.use(helmet());

// Create "One-off Scheduled Events" in Hasura from Send component for selected destinations
app.post("/create-send-events/:sessionId", createSendEvents);

assert(process.env.GOVUK_NOTIFY_API_KEY);
assert(process.env.HASURA_PLANX_API_KEY);

assert(process.env.BOPS_API_TOKEN);
assert(process.env.BOPS_SUBMISSION_URL_LAMBETH);
assert(process.env.BOPS_SUBMISSION_URL_BUCKINGHAMSHIRE);
assert(process.env.BOPS_SUBMISSION_URL_SOUTHWARK);
assert(process.env.BOPS_SUBMISSION_URL_CAMDEN);
assert(process.env.BOPS_SUBMISSION_URL_GLOUCESTER);
app.post("/bops/:localAuthority", useHasuraAuth, sendToBOPS);

assert(process.env.UNIFORM_TOKEN_URL);
assert(process.env.UNIFORM_SUBMISSION_URL);
app.post("/uniform/:localAuthority", useHasuraAuth, sendToUniform);

app.post("/email-submission/:localAuthority", useHasuraAuth, sendToEmail);

app.get("/download-application-files/:sessionId", downloadApplicationFiles);

["BUCKINGHAMSHIRE", "LAMBETH", "SOUTHWARK"].forEach((authority) => {
  assert(process.env[`GOV_UK_PAY_TOKEN_${authority}`]);
});

app.post(
  "/payment-request/:paymentRequest/pay",
  fetchPaymentRequestDetails,
  buildPaymentPayload,
  makeInviteToPayPaymentViaProxy,
);

app.get(
  "/payment-request/:paymentRequest/payment/:paymentId",
  fetchPaymentRequestDetails,
  fetchPaymentRequestViaProxy,
);

// needed for storing original URL to redirect to in login flow
app.use(
  cookieSession({
    maxAge: 24 * 60 * 60 * 100,
    name: "session",
    secret: process.env.SESSION_SECRET,
  }),
);

passport.use("google", googleStrategy);

passport.serializeUser(function (user, cb) {
  cb(null, user);
});

passport.deserializeUser(function (obj: Express.User, cb) {
  cb(null, obj);
});
app.use(passport.initialize());
app.use(passport.session());
app.use(urlencoded({ extended: true }));

app.use(authRoutes);
app.use(miscRoutes);
app.use("/user", userRoutes);
app.use("/team", teamRoutes);
app.use("/webhooks", webhookRoutes);
app.use("/analytics", analyticsRoutes);
app.use("/admin", adminRoutes);
app.use(ordnanceSurveyRoutes);
app.use("/file", fileRoutes);
app.use(saveAndReturnRoutes);
app.use(sendEmailRoutes);
app.use("/flows", flowRoutes);
app.use(payRoutes);

app.use("/gis", router);

app.get("/gis", (_req, _res, next) => {
  next({
    status: 400,
    message: "Please specify a local authority",
  });
});

app.get("/gis/:localAuthority", locationSearch);

app.get("/roads", classifiedRoadsSearch);

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

app.post("/invite-to-pay/:sessionId", inviteToPay);

const errorHandler: ErrorRequestHandler = (errorObject, _req, res, _next) => {
  const { status = 500, message = "Something went wrong" } = (() => {
    if (
      airbrake &&
      (errorObject instanceof Error || errorObject instanceof ServerError)
    ) {
      airbrake.notify(errorObject);
      return {
        ...errorObject,
        message: errorObject.message.concat(", this error has been logged"),
      };
    } else {
      console.log(errorObject);
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
}
