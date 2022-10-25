import assert from "assert";
import { urlencoded } from "body-parser";
import { stringify } from "csv-stringify";
import { adminGraphQLClient as client } from "../hasura";
import { useHasuraAuth, useSendEmailAuth } from "../auth";
import cookieSession from "cookie-session";
import app from "./cookieless";
import router from "../auth/routes";
import passport from "../auth/passport";
import { useJWT } from "../auth/jwt";
import { sendEmailLimiter } from "../rateLimit";
import { signS3Upload } from "../s3";
import { locationSearch } from "../gis/index";
import { diffFlow, publishFlow } from "../editor/publish";
import { findAndReplaceInFlow } from "../editor/findReplace";
import { copyPortalAsFlow } from "../editor/copyPortalAsFlow";
import {
  resumeApplication,
  validateSession,
  sendSaveAndReturnEmail,
} from "../saveAndReturn";
import { hardDeleteSessions } from "../webhooks/hardDeleteSessions";
import { sendSlackNotification } from "../webhooks/sendNotifications";
import {
  createReminderEvent,
  createExpiryEvent,
} from "../webhooks/lowcalSessionEvents";

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

assert(process.env.HASURA_PLANX_API_KEY);
app.use("/webhooks/hasura", useHasuraAuth);
app.post("/webhooks/hasura/delete-expired-sessions", hardDeleteSessions);
app.post("/webhooks/hasura/create-reminder-event", createReminderEvent);
app.post("/webhooks/hasura/create-expiry-event", createExpiryEvent);
app.post("/webhooks/hasura/send-slack-notification", sendSlackNotification);

export default app;
