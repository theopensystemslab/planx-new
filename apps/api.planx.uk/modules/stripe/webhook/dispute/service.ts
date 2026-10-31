import type Stripe from "stripe";

import { stripe } from "../../client.js";
import { alertPlanX, formatPence, getStripeId } from "../../helpers.js";
import { getSessionForPayment } from "../ownership/service.js";

/**
 * Alert PlanX when a payer disputes a payment, for any payment method
 *
 * PlanX handles disputes by hand in the Stripe Dashboard
 *
 * @docs https://docs.stripe.com/disputes
 */
export async function alertDisputeCreated(
  dispute: Stripe.Dispute,
  eventType: Stripe.Event.Type,
): Promise<void> {
  const paymentIntentId = getStripeId(dispute.payment_intent);
  // Should not happen - every PlanX payment has a PaymentIntent
  if (!paymentIntentId) {
    throw new Error(`Stripe dispute ${dispute.id} has no PaymentIntent`);
  }

  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
  const session = await getSessionForPayment(paymentIntent, eventType);
  if (!session) return;

  const message = [
    `:rotating_light: *Stripe dispute opened* [${session.teamSlug}]`,
    `Council: ${session.teamName}`,
    `Service: ${session.flowName}`,
    `Session: ${session.sessionId}`,
    `Amount: ${formatPence(dispute.amount)}`,
    `Reason: ${dispute.reason}`,
    `Payment method: ${dispute.payment_method_details?.type ?? "unknown"}`,
    `Payment: ${paymentIntentId}`,
    `Dispute: ${dispute.id}`,
  ].join("\n");

  await alertPlanX(message);
}
