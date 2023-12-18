import { Router } from "express";
import { useHasuraAuth } from "../auth/middleware";
import { createPaymentSendEvents } from "../pay/service/inviteToPay/createPaymentSendEvents";
import { validate } from "../../shared/middleware/validate";
import {
  isCleanJSONBController,
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
import { isCleanJSONBSchema } from "./service/validateInput/schema";

const router = Router();

router.use("/webhooks/hasura", useHasuraAuth);
router.post(
  "/webhooks/hasura/create-payment-invitation-events",
  validate(createPaymentEventSchema),
  createPaymentInvitationEventsController,
);
router.post(
  "/webhooks/hasura/create-payment-reminder-events",
  validate(createPaymentEventSchema),
  createPaymentReminderEventsController,
);
router.post(
  "/webhooks/hasura/create-payment-expiry-events",
  validate(createPaymentEventSchema),
  createPaymentExpiryEventsController,
);
router.post(
  "/webhooks/hasura/send-slack-notification",
  validate(sendSlackNotificationSchema),
  sendSlackNotificationController,
);
router.post(
  "/webhooks/hasura/create-reminder-event",
  validate(createSessionEventSchema),
  createSessionReminderEventController,
);
router.post(
  "/webhooks/hasura/create-expiry-event",
  validate(createSessionEventSchema),
  createSessionExpiryEventController,
);
router.post(
  "/webhooks/hasura/sanitise-application-data",
  sanitiseApplicationDataController,
);

router.post(
  "/webhooks/hasura/validate-input/jsonb/clean-html",
  validate(isCleanJSONBSchema),
  isCleanJSONBController,
);

// TODO: Convert to the new API module structure
router.post(
  "/webhooks/hasura/create-payment-send-events",
  createPaymentSendEvents,
);

export default router;
