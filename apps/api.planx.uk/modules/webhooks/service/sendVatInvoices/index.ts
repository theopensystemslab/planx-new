import { stripe } from "../../../stripe/client.js";
import { getOwnedPaymentIntent } from "../../../stripe/webhook/ownership/service.js";
import { sendVatInvoices } from "../../../stripe/webhook/vatInvoice/service.js";

/**
 * Send VAT invoices for a PaymentIntent recorded as succeeded in payment_status
 *
 * The event trigger only carries the payment_status row, so we re-fetch the PaymentIntent from Stripe
 * Throws errors to make Hasura retry the event
 */
export const sendVatInvoicesForPaymentIntent = async (
  paymentIntentId: string,
): Promise<void> => {
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

  const ownedPaymentIntent = await getOwnedPaymentIntent(
    paymentIntent,
    "succeeded",
  );
  if (!ownedPaymentIntent) return;

  await sendVatInvoices(paymentIntent, ownedPaymentIntent);
};
