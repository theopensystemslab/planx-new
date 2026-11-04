import { reportError } from "../../../pay/helpers.js";
import { sendSlackMessage } from "../../../slack/utils.js";
import { stripe } from "../../../stripe/client.js";
import { getSessionForPayment } from "../../../stripe/webhook/ownership/service.js";
import { createInvoices } from "../../../stripe/webhook/vatInvoice/service.js";

/**
 * Side effects of a PaymentIntent recorded as succeeded in payment_status - for Bacs, once it has cleared
 *  - Create and store the VAT documents
 *
 * The event trigger only carries the payment_status row, so we re-fetch the PaymentIntent from Stripe
 * Throws errors to make Hasura retry the event - each step is safe to retry
 */
export const handlePaymentSucceeded = async (
  paymentIntentId: string,
): Promise<void> => {
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

  const paymentSession = await getSessionForPayment(paymentIntent, "succeeded");
  if (!paymentSession) return;

  await createInvoices(paymentIntent, paymentSession);
};

/**
 * Hasura has used up its retries - report the error and alert PlanX, so the payment can be followed up manually
 */
export const alertPaymentSucceededFailed = async (
  paymentIntentId: string,
  error: unknown,
): Promise<void> => {
  reportError({ error, context: { paymentIntentId } });

  const text = `:warning: Could not create VAT documents for Stripe payment *${paymentIntentId}* - Hasura has stopped retrying. Needs following up manually.`;

  if (process.env.APP_ENVIRONMENT !== "production") {
    console.log(`Skipping Slack notification on non-production:\n${text}`);
    return;
  }

  await sendSlackMessage({
    channel: "#planx-notifications-internal",
    text,
    username: "Stripe payment events",
  });
};
