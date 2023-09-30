import { Router } from "express";
import { useHasuraAuth } from "../auth/middleware";
import { createPaymentSendEvents } from "../../inviteToPay/createPaymentSendEvents";
import { sanitiseApplicationData } from "./_old/sanitiseApplicationData";
import {
  createExpiryEvent,
  createReminderEvent,
} from "./_old/lowcalSessionEvents";
import { validate } from "../../shared/middleware/validate";
import {
  createPaymentExpiryEventsController,
  createPaymentInvitationEventsController,
  createPaymentReminderEventsController,
  sendSlackNotificationController,
} from "./controller";
import { sendSlackNotificationSchema } from "./sendNotification/schema";
import { createPaymentEventSchema } from "./paymentRequestEvents/schema";

const router = Router();

router.use("/hasura", useHasuraAuth);
router.post(
  "/hasura/create-payment-invitation-events",
  validate(createPaymentEventSchema),
  createPaymentInvitationEventsController,
);
router.post(
  "/hasura/create-payment-reminder-events",
  validate(createPaymentEventSchema),
  createPaymentReminderEventsController,
);
router.post(
  "/hasura/create-payment-expiry-events",
  validate(createPaymentEventSchema),
  createPaymentExpiryEventsController,
);
router.post(
  "/hasura/send-slack-notification",
  validate(sendSlackNotificationSchema),
  sendSlackNotificationController,
);

// TODO: Convert these routes to the new API module structure
router.post("/hasura/create-payment-send-events", createPaymentSendEvents);
router.post("/hasura/create-reminder-event", createReminderEvent);
router.post("/hasura/create-expiry-event", createExpiryEvent);
router.post("/hasura/sanitise-application-data", sanitiseApplicationData);

export default router;
