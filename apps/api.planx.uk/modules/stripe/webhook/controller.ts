import type Stripe from "stripe";
import { z } from "zod";

import { reportError } from "../../pay/helpers.js";
import { fulfilPaymentRequest } from "../fulfilment/service.js";
import { propagateMetadataToDestinationPayment } from "./destinationPayment/service.js";
import { recordStripePaymentIntentStatus } from "./paymentStatus/service.js";
import type { StripeWebhookController } from "./types.js";

const inviteToPayMetadataSchema = z.object({ paymentRequestId: z.string() });

/**
 * Fulfil an ITP request once its Checkout Session is paid
 */
const handleCheckoutSessionPaid = async (
  checkoutSession: Stripe.Checkout.Session,
  eventType: Stripe.Event.Type,
): Promise<void> => {
  const { id } = checkoutSession;

  // Non-ITP Checkout Sessions (no paymentRequestId)
  // These are submitted by the applicant's browser, no action required
  if (!inviteToPayMetadataSchema.safeParse(checkoutSession.metadata).success) {
    return;
  }

  const result = await fulfilPaymentRequest(id);

  switch (result.status) {
    case "fulfilled":
    case "alreadyFulfilled":
    case "unpaid":
    case "foreign":
    case "notFound":
      return console.info(
        `Stripe Checkout Session ${id} (${eventType}): ${result.status}`,
      );
    // Needs investigating
    case "notPaymentRequest":
    case "mismatch":
      return reportError({
        error: `Could not fulfil payment request from Checkout Session ${id} (${result.status})`,
        context: { checkoutSessionId: id, eventType },
      });
  }
};

/**
 * Handle a verified inbound Stripe webhook event
 *
 * Event types must match those configured in Stripe
 *  - Staging & Production - events configured in Developer tab
 *  - Local & Pizza - events configured in variable STRIPE_EVENTS for stripe-cli container
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
      case "transfer.created":
        await propagateMetadataToDestinationPayment(event.data.object);
        break;
      case "checkout.session.completed":
        await handleCheckoutSessionPaid(event.data.object, event.type);
        break;
      default:
        console.log(
          `Ignoring unhandled Stripe event ${event.id} ${event.type}`,
        );
    }
  } catch (error) {
    // Handling failed - return a non-2xx so Stripe redelivers the event
    reportError({
      error: `Failed to handle Stripe webhook event: ${error}`,
      context: {
        eventId: event.id,
        eventType: event.type,
        ...(error instanceof Error && { cause: error.cause }),
      },
    });
    return res.status(500).send("Failed to handle Stripe webhook event");
  }

  return res.status(200).send();
};
