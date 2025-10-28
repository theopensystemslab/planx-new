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
import { sendIntegrationSchema } from "./types.js";
import { sendToGOSSController } from "./goss/controller.js";

const router = Router();

router.post(
  "/create-send-events/:sessionId",
  validate(combinedEventsPayloadSchema),
  createSendEvents,
);
router.post(
  "/bops/:localAuthority",
  useHasuraAuth,
  validate(sendIntegrationSchema),
  sendToBOPS,
);
router.post(
  "/uniform/:localAuthority",
  useHasuraAuth,
  validate(sendIntegrationSchema),
  sendToUniform,
);
router.post(
  "/idox/:localAuthority",
  useHasuraAuth,
  validate(sendIntegrationSchema),
  sendToIdoxNexus,
);
router.post(
  "/email-submission/:localAuthority",
  useHasuraAuth,
  validate(sendIntegrationSchema),
  sendToEmail,
);
router.post(
  "/upload-submission/:localAuthority",
  useHasuraAuth,
  validate(sendIntegrationSchema),
  sendToS3,
);
router.post(
  "/goss/:localAuthority",
  useHasuraAuth,
  validate(sendIntegrationSchema),
  sendToGOSSController,
);

router.get("/download-application-files/:sessionId", downloadApplicationFiles);

export default router;
