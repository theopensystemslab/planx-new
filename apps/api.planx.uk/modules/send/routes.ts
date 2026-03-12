import { Router } from "express";
import { validate } from "../../shared/middleware/validate.js";
import {
  useFilePermission,
  useHasuraAuth,
  useNoCache,
  useTeamEditorAuth,
} from "../auth/middleware.js";
import { sendToBOPS } from "./bops/bops.js";
import { createSendEvents } from "./createSendEvents/controller.js";
import { combinedEventsPayloadSchema } from "./createSendEvents/types.js";
import { sendToEmail } from "./email/index.js";
import { getSubmissionsController, getSubmissionsSchema } from "./fme/index.js";
import { sendToIdoxNexus } from "./idox/nexus.js";
import { sendToS3 } from "./s3/index.js";
import { submissionHTMLController } from "./submission/html/controller.js";
import { submissionSchema } from "./submission/schema.js";
import { submissionZipController } from "./submission/zip/controller.js";
import { sendIntegrationSchema } from "./types.js";
import { sendToUniform } from "./uniform/uniform.js";
import { useAccessTokenAuth } from "./downloadSubmission/middleware.js";
import { useAccessTokenAuthSchema } from "./downloadSubmission/types.js";
import { downloadSubmission } from "./downloadSubmission/controller.js";
import { sendNewDownloadLinkSchema } from "./email/newLink/types.js";
import { sendNewDownloadLink } from "./email/newLink/controller.js";

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
  "/email-submission/download-link",
  validate(sendNewDownloadLinkSchema),
  sendNewDownloadLink,
);
router.post(
  "/upload-submission/:localAuthority",
  useHasuraAuth,
  validate(sendIntegrationSchema),
  sendToS3,
);

router.get(
  "/download-submission",
  useNoCache,
  validate(useAccessTokenAuthSchema),
  useAccessTokenAuth,
  downloadSubmission,
);

router.get(
  "/submissions/:localAuthority",
  useFilePermission,
  validate(getSubmissionsSchema),
  getSubmissionsController,
);

router.get(
  "/submission/:sessionId/html",
  useTeamEditorAuth,
  validate(submissionSchema),
  submissionHTMLController,
);
router.get(
  "/submission/:sessionId/zip",
  useTeamEditorAuth,
  validate(submissionSchema),
  submissionZipController,
);

export default router;
