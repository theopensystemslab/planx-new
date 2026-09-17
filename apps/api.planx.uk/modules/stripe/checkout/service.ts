import { stripe } from "../client.js";
import type { StripePaymentMetadata } from "../webhook/paymentStatus/types.js";
import type {
  CreateCheckoutSessionInput,
  CreateCheckoutSessionResponse,
} from "./types.js";

/**
 * Create a Stripe Checkout Session and return the hosted checkout URL
 */
export const createStripeCheckoutSession = async ({
  sessionId,
  flowId,
  amount,
  returnURL,
  teamSlug,
}: CreateCheckoutSessionInput): Promise<CreateCheckoutSessionResponse> => {
  const separator = returnURL.includes("?") ? "&" : "?";

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    // TODO: Configure payment types
    payment_method_types: ["card"],
    // TODO: Read values from FeeBreakdown + flow name
    line_items: [
      {
        price_data: {
          currency: "gbp",
          product_data: { name: "Planning application fee" },
          unit_amount: amount,
        },
        quantity: 1,
      },
    ],
    success_url: `${returnURL}${separator}stripeSessionId={CHECKOUT_SESSION_ID}`,
    cancel_url: `${returnURL}${separator}cancelled=true`,
    // TODO: Add metadata
    metadata: { sessionId, flowId },
    payment_intent_data: {
      metadata: { sessionId, flowId, teamSlug } satisfies StripePaymentMetadata,
    },
  });

  return { url: session.url };
};
