import { Router } from "express";
import { createSendEvents } from "./createSendEvents/controller";
import { useHasuraAuth } from "../auth/middleware";
import { sendToBOPS } from "./bops/bops";
import { sendToUniform } from "./uniform/uniform";
import { downloadApplicationFiles, sendToEmail } from "./email/email";
import { validate } from "../../shared/middleware/validate";
import { combinedEventsPayloadSchema } from "./createSendEvents/types";

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

export default router;
