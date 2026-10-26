import type { StripePaymentStatus } from "../../types.js";
import { sendSlackMessage } from "../slack/utils.js";

/**
 * Get the ID from a Stripe reference which may or may not be expanded
 * e.g. `payment_intent` can be either `"pi_…"` or a `Stripe.PaymentIntent`
 */
export const getStripeId = (ref: string | { id: string } | null | undefined) =>
  typeof ref === "string" ? ref : ref?.id;

export const formatPence = (pence: number) =>
  (pence / 100).toLocaleString("en-GB", { style: "currency", currency: "GBP" });

/**
 * Go-live switch
 *
 * Stripe payments are off in production, so teams can connect a Stripe account ahead of time but can't migrate from GOV.UK Pay or take payments
 */
export const isStripePaymentsEnabled = (): boolean =>
  process.env.APP_ENVIRONMENT !== "production";

/**
 * On production, notify #planx-notifications of Stripe payments
 *   (omitting "created" status to minimise noise) so we can monitor for subsequent submissions
 */
export async function postStripePaymentNotificationToSlack(
  teamSlug: string,
  paymentId: string,
  status: Exclude<StripePaymentStatus, "created">,
  isInviteToPay?: boolean,
) {
  if (process.env.APP_ENVIRONMENT === "production") {
    const payMessage = `:coin: New Stripe payment ${isInviteToPay ? `(invite to pay)` : undefined} *${paymentId}* with status *${status}* [${teamSlug}]`;
    await sendSlackMessage(payMessage);
    console.log("Payment notification posted to Slack");
  } else {
    console.log("Not production, skipping Slack payment notification");
  }
}
