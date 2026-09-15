import type { StripeWebhookController } from "./types.js";

/**
 * Handle a verified inbound Stripe webhook event
 *
 * Signature verification and parsing happens upstream in `verifyStripeWebhook()`
 */
export const handleStripeWebhook: StripeWebhookController = (_req, res) => {
  const { stripeEvent: event } = res.locals;

  switch (event.type) {
    case "payment_intent.succeeded":
    case "payment_intent.payment_failed":
      // TODO: Persist payment status, don't just log
      console.log(`Stripe event ${event.id} ${event.type}`);
      break;
    default:
      console.log(`Ignoring unhandled Stripe event ${event.id} ${event.type}`);
  }

  // TODO: Persist raw Stripe event to DB
  return res.status(200).send();
};
