import Stripe from "stripe";

import { getStripeTestClient } from "./client.js";

export const stripeTestCards = {
  success: "tok_visa",
  declined: "tok_chargeDeclined",
} as const;

export type StripeTestCard = keyof typeof stripeTestCards;

/**
 * Our API returns the hosted Checkout URL, not the session ID
 * e.g. https://checkout.stripe.com/c/pay/cs_test_abc123#fragment
 */
export const getCheckoutSessionId = (checkoutURL: string): string => {
  const id = checkoutURL.match(/cs_test_[A-Za-z0-9]+/)?.[0];
  if (!id) {
    throw Error(
      `No test mode Checkout Session ID found in URL: ${checkoutURL}`,
    );
  }
  return id;
};

/**
 * Complete a Stripe Checkout Session without a browser
 *
 * @description
 * Stripe-hosted Checkout has bot protection which prevents automated testing (please see
 * https://docs.stripe.com/automated-testing), so E2E tests never access it directly.
 *
 * Instead we manage the Checkout Session via the Stripe SDK
 *
 * The stripe-cli container is running and triggers all webhooks, which then hit our API
 *
 * Pays with a Stripe test card, and returns the PaymentIntent as Stripe recorded it
 * A declined card leaves the session open, so it can be retried
 */
export const completeStripeCheckoutSession = async (
  checkoutSessionId: string,
  card: StripeTestCard = "success",
): Promise<Stripe.PaymentIntent> => {
  const stripe = getStripeTestClient();

  const session = await stripe.checkout.sessions.retrieve(checkoutSessionId);

  // Initialises the payment page
  await stripe.rawRequest("GET", `/v1/payment_pages/${checkoutSessionId}`);

  const paymentMethod = await stripe.paymentMethods.create({
    type: "card",
    card: { token: stripeTestCards[card] },
    billing_details: {
      name: "Test Test",
      email: "simulate-delivered@notifications.service.gov.uk",
    },
  });

  try {
    await stripe.rawRequest(
      "POST",
      `/v1/payment_pages/${checkoutSessionId}/confirm`,
      {
        payment_method: paymentMethod.id,
        expected_amount: session.amount_total,
      },
    );
  } catch (error) {
    // A declined card throws, but still leaves a PaymentIntent to inspect
    if (!(error instanceof Stripe.errors.StripeCardError)) throw error;
  }

  const { payment_intent } = await stripe.checkout.sessions.retrieve(
    checkoutSessionId,
    { expand: ["payment_intent"] },
  );
  if (!payment_intent || typeof payment_intent === "string") {
    throw Error(`No PaymentIntent on Checkout Session ${checkoutSessionId}`);
  }

  return payment_intent;
};
