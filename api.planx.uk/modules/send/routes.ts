import { Router } from "express";
import { createSendEvents } from "./createSendEvents/controller.js";
import { useHasuraAuth } from "../auth/middleware.js";
import { sendToBOPS } from "./bops/bops.js";
import { sendToUniform } from "./uniform/uniform.js";
import { sendToEmail } from "./email/index.js";
import { validate } from "../../shared/middleware/validate.js";
import { combinedEventsPayloadSchema } from "./createSendEvents/types.js";
import { downloadApplicationFiles } from "./downloadApplicationFiles/index.js";
import { sendToS3 } from "./s3/index.js";
import { sendToIdoxNexus } from "./idox/nexus.js";

const router = Router();

router.post(
  "/create-send-events/:sessionId",
  validate(combinedEventsPayloadSchema),
  createSendEvents,
);
router.post("/bops/:localAuthority", useHasuraAuth, sendToBOPS);
router.post("/uniform/:localAuthority", useHasuraAuth, sendToUniform);
router.post("/idox/:localAuthority", useHasuraAuth, sendToIdoxNexus);
router.post("/email-submission/:localAuthority", useHasuraAuth, sendToEmail);
router.get("/download-application-files/:sessionId", downloadApplicationFiles);
router.post("/upload-submission/:localAuthority", useHasuraAuth, sendToS3);

export default router;
