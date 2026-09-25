import type Stripe from "stripe";

import { reportError } from "../../../pay/helpers.js";
import { stripe } from "../../client.js";
import { getStripeId } from "../../helpers.js";

/**
 * Copy the PaymentIntent metadata onto the transferred (destination) payment
 * that lives on the LPA's connected account
 *
 */
export async function propagateMetadataToDestinationPayment(
  transfer: Stripe.Transfer,
): Promise<void> {
  const { id: transferId } = transfer;

  const chargeId = getStripeId(transfer.source_transaction);
  if (!chargeId) {
    // Not a destination charge (e.g. a manual transfer) - nothing to propagate
    console.log(`Ignoring transfer ${transferId} with no source_transaction`);
    return;
  }

  const destinationPaymentId = getStripeId(transfer.destination_payment);
  const connectedAccountId = getStripeId(transfer.destination);
  if (!destinationPaymentId || !connectedAccountId) {
    return reportMissingLink("destination_payment", transferId);
  }

  // Webhook payloads aren't expanded, so we must re-fetch the associated PaymentIntent
  const charge = await stripe.charges.retrieve(chargeId, {
    expand: ["payment_intent"],
  });

  const paymentIntent = charge.payment_intent;
  if (!paymentIntent || typeof paymentIntent === "string") {
    return reportMissingLink("payment_intent", transferId);
  }

  await stripe.charges.update(
    destinationPaymentId,
    { metadata: paymentIntent.metadata },
    { stripeAccount: connectedAccountId },
  );
}

/**
 * Should not happen - mainly as escape hatch for type-narrowing
 *
 * We want to report to Airbrake if we hit this issue, but not throw an error
 * (retrying won't fix a permanently missing link, and a 5xx means Stripe will
 * keep re-trying to send the event)
 */
const reportMissingLink = (
  link: "destination_payment" | "payment_intent",
  transferId: string,
): void =>
  reportError({
    error: `Could not propagate metadata to destination payment: ${link} was missing from the transfer`,
    context: { transferId, link },
  });
