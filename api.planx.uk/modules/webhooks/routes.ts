import { Router } from "express";
import { useHasuraAuth } from "../auth/middleware";
import { createPaymentSendEvents } from "../../inviteToPay/createPaymentSendEvents";
import { sanitiseApplicationData } from "./_old/sanitiseApplicationData";
import {
  createExpiryEvent,
  createReminderEvent,
} from "./_old/lowcalSessionEvents";
import {
  createPaymentExpiryEvents,
  createPaymentInvitationEvents,
  createPaymentReminderEvents,
} from "./_old/paymentRequestEvents";
import { validate } from "../../shared/middleware/validate";
import { sendSlackNotificationController } from "./controller";
import { sendSlackNotificationSchema } from "./sendNotification/schema";

const router = Router();

router.use("/hasura", useHasuraAuth);
router.post("/hasura/create-reminder-event", createReminderEvent);
router.post("/hasura/create-expiry-event", createExpiryEvent);
router.post(
  "/hasura/create-payment-invitation-events",
  createPaymentInvitationEvents,
);
router.post(
  "/hasura/create-payment-reminder-events",
  createPaymentReminderEvents,
);
router.post("/hasura/create-payment-expiry-events", createPaymentExpiryEvents);
router.post("/hasura/create-payment-send-events", createPaymentSendEvents);
router.post(
  "/hasura/send-slack-notification",
  validate(sendSlackNotificationSchema),
  sendSlackNotificationController,
);
router.post("/hasura/sanitise-application-data", sanitiseApplicationData);

export default router;
