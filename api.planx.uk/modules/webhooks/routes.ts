import { Router } from "express";
import { useHasuraAuth } from "../auth/middleware";
import { createPaymentSendEvents } from "../../inviteToPay/createPaymentSendEvents";
import { validate } from "../../shared/middleware/validate";
import {
  createPaymentExpiryEventsController,
  createPaymentInvitationEventsController,
  createPaymentReminderEventsController,
  createSessionExpiryEventController,
  createSessionReminderEventController,
  sanitiseApplicationDataController,
  sendSlackNotificationController,
} from "./controller";
import { sendSlackNotificationSchema } from "./service/sendNotification/schema";
import { createPaymentEventSchema } from "./service/paymentRequestEvents/schema";
import { createSessionEventSchema } from "./service/lowcalSessionEvents/schema";

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
router.post(
  "/hasura/create-reminder-event",
  validate(createSessionEventSchema),
  createSessionReminderEventController,
);
router.post(
  "/hasura/create-expiry-event",
  validate(createSessionEventSchema),
  createSessionExpiryEventController,
);
router.post(
  "/hasura/sanitise-application-data",
  sanitiseApplicationDataController,
);

// TODO: Convert to the new API module structure
router.post("/hasura/create-payment-send-events", createPaymentSendEvents);

export default router;
