import express from "express";
import { stringify } from "csv-stringify";
import { adminGraphQLClient as client } from "../hasura";
import { createSendEvents } from "../send/createSendEvents";
import { resumeApplication, validateSession } from "../saveAndReturn";
import { sendEmailLimiter } from "../rateLimit";
import { signS3Upload } from "../s3";

const router = express.Router();

router.get("/", (_req, res) => {
  res.json({ hello: "world" });
});

// XXX: leaving this in temporarily as a testing endpoint to ensure it
//      works correctly in staging and production
router.get("/throw-error", () => {
  throw new Error("custom error");
});

router.get("/hasura", async function (_req, res, next) {
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

// Create "One-off Scheduled Events" in Hasura from Send component for selected destinations
router.post("/create-send-events/:sessionId", createSendEvents);

router.post("/resume-application", sendEmailLimiter, resumeApplication);
router.post("/validate-session", validateSession);

// allows an applicant to download their application data on the Confirmation page
router.post("/download-application", async (req, res, next) => {
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

router.post("/sign-s3-upload", async (req, res, next) => {
  if (!req.body.filename) {
    return next({ status: 422, message: "missing filename" });
  }
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

export default router;
