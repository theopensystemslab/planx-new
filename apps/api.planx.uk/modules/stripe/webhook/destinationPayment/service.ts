import type Stripe from "stripe";

import { reportError } from "../../../pay/helpers.js";
import { stripe } from "../../client.js";

/**
 * Copy the PaymentIntent metadata onto the transferred (destination) payment
 * that lives on the LPA's connected account
 *
 * Webhook payloads aren't expanded, so we must re-fetch the associate charge
 * and transfer objects
 */
export async function propagateMetadataToDestinationPayment(
  paymentIntent: Stripe.PaymentIntent,
): Promise<void> {
  const { id: paymentIntentId, metadata } = paymentIntent;

  try {
    const pi = await stripe.paymentIntents.retrieve(paymentIntentId, {
      expand: ["latest_charge.transfer"],
    });

    const charge = pi.latest_charge;
    if (!charge || typeof charge === "string") {
      return reportMissingLink("latest_charge", paymentIntentId);
    }

    const transfer = charge.transfer;
    if (!transfer || typeof transfer === "string") {
      return reportMissingLink("transfer", paymentIntentId);
    }

    const destinationPaymentId =
      typeof transfer.destination_payment === "string"
        ? transfer.destination_payment
        : transfer.destination_payment?.id;

    const connectedAccountId =
      typeof transfer.destination === "string"
        ? transfer.destination
        : transfer.destination?.id;

    if (!destinationPaymentId || !connectedAccountId) {
      return reportMissingLink("destination_payment", paymentIntentId);
    }

    await stripe.charges.update(
      destinationPaymentId,
      { metadata },
      { stripeAccount: connectedAccountId },
    );
  } catch (error) {
    reportError({
      error: `Failed to propagate metadata to destination payment: ${error}`,
      context: {
        paymentIntentId,
        ...(error instanceof Error && { cause: error.cause }),
      },
    });
  }
}

/**
 * Should not happen - mainly as escape hatch for type-narrowing
 *
 * We want to report to Airbrake if we hit this issue, but not throw an error
 * (if we return a 5xx Stripe will keep re-trying to send the event)
 */
const reportMissingLink = (
  link: "latest_charge" | "transfer" | "destination_payment",
  paymentIntentId: string,
): void =>
  reportError({
    error: `Could not propagate metadata to destination payment: ${link} was missing from the expanded PaymentIntent`,
    context: { paymentIntentId, link },
  });
