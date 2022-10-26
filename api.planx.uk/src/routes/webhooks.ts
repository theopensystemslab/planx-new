import express from "express";
import { useHasuraAuth } from "../auth";
import { hardDeleteSessions } from "../webhooks/hardDeleteSessions";
import { sendSlackNotification } from "../webhooks/sendNotifications";
import {
  createReminderEvent,
  createExpiryEvent,
} from "../webhooks/lowcalSessionEvents";

const router = express.Router();

router.use("/webhooks/hasura", useHasuraAuth);
router.post("/webhooks/hasura/delete-expired-sessions", hardDeleteSessions);
router.post("/webhooks/hasura/create-reminder-event", createReminderEvent);
router.post("/webhooks/hasura/create-expiry-event", createExpiryEvent);
router.post("/webhooks/hasura/send-slack-notification", sendSlackNotification);

export default router;
