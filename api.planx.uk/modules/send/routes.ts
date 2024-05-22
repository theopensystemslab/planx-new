import { Router } from "express";
import { createSendEvents } from "./createSendEvents/controller";
import { useHasuraAuth } from "../auth/middleware";
import { sendToBOPS } from "./bops/bops";
import { sendToUniform } from "./uniform/uniform";
import { sendToEmail } from "./email";
import { validate } from "../../shared/middleware/validate";
import { combinedEventsPayloadSchema } from "./createSendEvents/types";
import { downloadApplicationFiles } from "./downloadApplicationFiles";
import { sendToS3 } from "./s3";

const router = Router();

router.post(
  "/create-send-events/:sessionId",
  validate(combinedEventsPayloadSchema),
  createSendEvents,
);
router.post("/bops/:localAuthority", useHasuraAuth, sendToBOPS);
router.post("/uniform/:localAuthority", useHasuraAuth, sendToUniform);
router.post("/email-submission/:localAuthority", useHasuraAuth, sendToEmail);
router.get("/download-application-files/:sessionId", downloadApplicationFiles);
router.post("/upload-submission/:localAuthority", useHasuraAuth, sendToS3);

export default router;
