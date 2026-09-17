import { reportError } from "../../pay/helpers.js";
import { recordStripePaymentIntentStatus } from "./paymentStatus/service.js";
import type { StripeWebhookController } from "./types.js";

/**
 * Handle a verified inbound Stripe webhook event
 */
export const handleStripeWebhook: StripeWebhookController = async (
  _req,
  res,
) => {
  const { stripeEvent: event } = res.locals;

  try {
    switch (event.type) {
      case "payment_intent.created":
        await recordStripePaymentIntentStatus(event.data.object, "created");
        break;
      case "payment_intent.processing":
        await recordStripePaymentIntentStatus(event.data.object, "processing");
        break;
      case "payment_intent.succeeded":
        await recordStripePaymentIntentStatus(event.data.object, "succeeded");
        break;
      case "payment_intent.payment_failed":
        await recordStripePaymentIntentStatus(
          event.data.object,
          "payment_failed",
        );
        break;
      default:
        console.log(
          `Ignoring unhandled Stripe event ${event.id} ${event.type}`,
        );
    }
  } catch (error) {
    // Recording failed - return a non-2xx so Stripe redelivers the event
    reportError({
      error: `Failed to record Stripe webhook event: ${error}`,
      context: {
        eventId: event.id,
        eventType: event.type,
        ...(error instanceof Error && { cause: error.cause }),
      },
    });
    return res.status(500).send("Failed to record payment status");
  }

  return res.status(200).send();
};
