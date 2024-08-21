import { Router } from "express";
import { validate } from "../../shared/middleware/validate.js";
import { useTeamEditorAuth } from "../auth/middleware.js";
import {
  sendSlackNotificationController,
  slackNotificationSchema,
} from "./controller.js";

const router = Router();

router.post(
  "/send-slack-notification",
  useTeamEditorAuth,
  validate(slackNotificationSchema),
  sendSlackNotificationController,
);

export default router;
