import {
  calculateStripeSplit,
  getFeeBreakdown,
} from "@opensystemslab/planx-core";
import type { FeeBreakdown, Session } from "@opensystemslab/planx-core/types";
import { gql } from "graphql-request";

import { $api } from "../../../client/index.js";
import { stripe } from "../client.js";
import type { StripePaymentMetadata } from "../webhook/paymentStatus/types.js";
import { buildLineItems } from "./lineItems.js";
import type {
  CheckoutSessionStatusResponse,
  CreateCheckoutSessionInput,
  CreateCheckoutSessionResponse,
} from "./types.js";

const getFeeBreakdownForSession = async (
  sessionId: string,
): Promise<FeeBreakdown | null> => {
  const response = await $api.client.request<{
    session: Partial<{
      passportData: Session["data"]["passport"]["data"];
    }> | null;
  }>(
    gql`
      query GetCheckoutSessionPassportData($id: uuid!) {
        session: lowcal_sessions_by_pk(id: $id) {
          passportData: data(path: "passport.data")
        }
      }
    `,
    { id: sessionId },
  );

  const passportData = response?.session?.passportData;
  return passportData ? getFeeBreakdown(passportData) : null;
};

/**
 * Create a Stripe Checkout Session and return the hosted checkout URL
 */
export const createStripeCheckoutSession = async ({
  sessionId,
  flowId,
  amount,
  returnURL,
  teamSlug,
  connectedAccountId,
}: CreateCheckoutSessionInput): Promise<CreateCheckoutSessionResponse> => {
  const separator = returnURL.includes("?") ? "&" : "?";

  const feeBreakdown = await getFeeBreakdownForSession(sessionId).catch(
    () => null,
  );

  const lineItems = feeBreakdown
    ? buildLineItems(feeBreakdown)
    : // Fallback values to ensure checkout is not blocked
      [
        {
          price_data: {
            currency: "gbp",
            product_data: { name: "Planning application fee" },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ];

  // PlanX's cut (the Stripe application fee)
  const split = feeBreakdown ? calculateStripeSplit(feeBreakdown) : undefined;
  // 0 is not a valid fee for Stripe, must be undefined if there's no fee amount
  const applicationFeeAmount = split?.applicationFeeAmount || undefined;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    // TODO: Configure payment types
    payment_method_types: ["card"],
    line_items: lineItems,
    success_url: `${returnURL}${separator}stripeSessionId={CHECKOUT_SESSION_ID}`,
    cancel_url: `${returnURL}${separator}cancelled=true`,
    // TODO: Add metadata
    metadata: { sessionId, flowId },
    payment_intent_data: {
      on_behalf_of: connectedAccountId,
      transfer_data: { destination: connectedAccountId },
      application_fee_amount: applicationFeeAmount,
      // PaymentIntent metadata is returned when the webhook is hit by Stripe
      metadata: { sessionId, flowId, teamSlug } satisfies StripePaymentMetadata,
    },
  });

  return { url: session.url };
};

export const getStripeCheckoutSessionStatus = async (
  checkoutSessionId: string,
): Promise<CheckoutSessionStatusResponse> => {
  const session = await stripe.checkout.sessions.retrieve(checkoutSessionId);

  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : (session.payment_intent?.id ?? null);

  return {
    status: session.status,
    paymentStatus: session.payment_status,
    paymentIntentId,
  };
};
