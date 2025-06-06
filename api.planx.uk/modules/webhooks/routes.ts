import { Router } from "express";
import { validate } from "../../shared/middleware/validate.js";
import { useHasuraAuth } from "../auth/middleware.js";
import { createPaymentSendEvents } from "../pay/service/inviteToPay/createPaymentSendEvents.js";
import {
  analyzeSessionsController,
  createPaymentExpiryEventsController,
  createPaymentInvitationEventsController,
  createPaymentReminderEventsController,
  createSessionExpiryEventController,
  createSessionReminderEventController,
  isCleanJSONBController,
  sanitiseApplicationDataController,
  sendSlackNotificationController,
  updateTemplatedFlowEditsController,
} from "./controller.js";
import { createSessionEventSchema } from "./service/lowcalSessionEvents/schema.js";
import { createPaymentEventSchema } from "./service/paymentRequestEvents/schema.js";
import { sendSlackNotificationSchema } from "./service/sendNotification/schema.js";
import { updateTemplatedFlowEditsEventSchema } from "./service/updateTemplatedFlowEdits/schema.js";
import { isCleanJSONBSchema } from "./service/validateInput/schema.js";

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
router.post("/webhooks/hasura/analyze-sessions", analyzeSessionsController);
router.post(
  "/webhooks/hasura/validate-input/jsonb/clean-html",
  validate(isCleanJSONBSchema),
  isCleanJSONBController,
);

router.post(
  "/webhooks/hasura/update-templated-flow-edits",
  validate(updateTemplatedFlowEditsEventSchema),
  updateTemplatedFlowEditsController,
);

// TODO: Convert to the new API module structure
router.post(
  "/webhooks/hasura/create-payment-send-events",
  createPaymentSendEvents,
);

export default router;
