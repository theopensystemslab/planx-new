import type Stripe from "stripe";
import { z } from "zod";

import { reportError } from "../../pay/helpers.js";
import { fulfilPaymentRequest } from "../fulfilment/service.js";
import {
  isDelayedPaymentPending,
  markDelayedPaymentPending,
} from "./delayedPayment/service.js";
import { propagateMetadataToDestinationPayment } from "./destinationPayment/service.js";
import { recordStripePaymentIntentStatus } from "./paymentStatus/service.js";
import type { StripeWebhookController } from "./types.js";

const inviteToPayMetadataSchema = z.object({ paymentRequestId: z.string() });

/**
 * Checkout has completed (checkout.session.completed), or a delayed payment has succeeded (checkout.session.async_payment_succeeded)
 *  - Invite to pay: fulfil the payment request once paid, which submits the application
 *  - Self-pay, paid at checkout (card, Pay by bank): submitted by the applicant's browser, no action required
 *  - Self-pay, delayed payment (e.g. Bacs) processing: lock the session, in case the applicant doesn't return to PlanX
 *  - Self-pay, delayed payment succeeded: no action required, submitted once payment_status records the
 *    succeeded PaymentIntent (see submitDelayedPayment)
 *
 * @docs https://docs.stripe.com/checkout/fulfillment
 */
const handleCheckoutSession = async (
  checkoutSession: Stripe.Checkout.Session,
  eventType: Stripe.Event.Type,
): Promise<void> => {
  const { id } = checkoutSession;

  if (!inviteToPayMetadataSchema.safeParse(checkoutSession.metadata).success) {
    if (isDelayedPaymentPending(checkoutSession)) {
      await markDelayedPaymentPending(checkoutSession);
    }
    return;
  }

  const result = await fulfilPaymentRequest(id);

  switch (result.status) {
    // A delayed payment (e.g. Bacs) is "pending" at checkout, and fulfilled by checkout.session.async_payment_succeeded
    case "fulfilled":
    case "alreadyFulfilled":
    case "pending":
    case "foreign":
      return console.info(
        `Stripe Checkout Session ${id} (${eventType}): ${result.status}`,
      );
    // Stripe has (or should have) taken payment, but we can't submit the application
    // Needs dev attention to debug
    case "unpaid":
    case "notFound":
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
        await recordStripePaymentIntentStatus(
          event.data.object,
          "created",
          event.id,
        );
        break;
      case "payment_intent.processing":
        await recordStripePaymentIntentStatus(
          event.data.object,
          "processing",
          event.id,
        );
        break;
      case "payment_intent.succeeded":
        await recordStripePaymentIntentStatus(
          event.data.object,
          "succeeded",
          event.id,
        );
        break;
      case "payment_intent.payment_failed":
        await recordStripePaymentIntentStatus(
          event.data.object,
          "payment_failed",
          event.id,
        );
        break;
      case "transfer.created":
        await propagateMetadataToDestinationPayment(event.data.object);
        break;
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded":
        await handleCheckoutSession(event.data.object, event.type);
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
