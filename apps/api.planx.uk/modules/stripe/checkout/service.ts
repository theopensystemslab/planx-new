import {
  calculateStripeSplit,
  getFeeBreakdown,
} from "@opensystemslab/planx-core";
import type { FeeBreakdown, Session } from "@opensystemslab/planx-core/types";
import { gql } from "graphql-request";

import { $api } from "../../../client/index.js";
import { ServerError } from "../../../errors/index.js";
import { reportError } from "../../pay/helpers.js";
import { stripe } from "../client.js";
import { getStripeId } from "../helpers.js";
import { insertStripePaymentStatus } from "../webhook/paymentStatus/service.js";
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

const getInitiatedCheckoutSessionIds = async (
  sessionId: string,
): Promise<string[]> => {
  const { paymentStatus } = await $api.client.request<{
    paymentStatus: { stripePaymentId: string }[];
  }>(
    gql`
      query GetInitiatedCheckoutSessions($sessionId: uuid!) {
        paymentStatus: payment_status(
          where: {
            session_id: { _eq: $sessionId }
            stripe_status: { _eq: initiated }
          }
        ) {
          stripePaymentId: stripe_payment_id
        }
      }
    `,
    { sessionId },
  );

  return paymentStatus.map(({ stripePaymentId }) => stripePaymentId);
};

/**
 * Ensure a PlanX session only ever has one payable Checkout Session
 *
 * Cancelling or abandoning the Stripe Checkout leaves the session open (for 24h)
 * Without this check an applicant could pay for an earlier session in another tab
 */
const expirePreviousCheckoutSessions = async (
  sessionId: string,
): Promise<void> => {
  const checkoutSessionIds = await getInitiatedCheckoutSessionIds(sessionId);

  const checkoutSessions = await Promise.all(
    checkoutSessionIds.map((id) => stripe.checkout.sessions.retrieve(id)),
  );

  await Promise.all(
    checkoutSessions
      .filter(({ status }) => status === "open")
      .map(({ id }) => stripe.checkout.sessions.expire(id)),
  );

  const completedSession = checkoutSessions.find(
    ({ status }) => status === "complete",
  );

  if (completedSession) {
    throw new ServerError({
      status: 422,
      message: `Session ${sessionId} has already been paid for via Checkout Session ${completedSession.id}`,
    });
  }
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
  metadata,
}: CreateCheckoutSessionInput): Promise<CreateCheckoutSessionResponse> => {
  await expirePreviousCheckoutSessions(sessionId);

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

  const paymentMetadata = {
    ...metadata,
    sessionId,
    // Non-prod environments share a Stripe sandbox
    // This identifies which environment owns this payment
    origin: process.env.API_URL_EXT!,
  };

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    // TODO: Configure payment types
    payment_method_types: ["card"],
    line_items: lineItems,
    success_url: `${returnURL}${separator}stripeSessionId={CHECKOUT_SESSION_ID}`,
    cancel_url: `${returnURL}${separator}cancelled=true`,
    metadata: paymentMetadata,
    payment_intent_data: {
      on_behalf_of: connectedAccountId,
      transfer_data: { destination: connectedAccountId },
      application_fee_amount: applicationFeeAmount,
      // PaymentIntent metadata is returned when the webhook is hit by Stripe
      metadata: paymentMetadata,
    },
  });

  await recordInitiatedPayment({
    checkoutSessionId: session.id,
    flowId,
    sessionId,
    teamSlug,
    amount: session.amount_total ?? amount,
    feeBreakdown,
    metadata: paymentMetadata,
  });

  return { url: session.url };
};

/**
 * Record that the applicant has been sent to Stripe, so that returning to their session skips reconciliation
 *
 * Stripe only creates a PaymentIntent (and fires payment_intent.* webhooks) once Checkout is confirmed,
 * so without this an applicant who cancels or abandons Checkout has no payment_status row at all
 */
const recordInitiatedPayment = async ({
  checkoutSessionId,
  ...args
}: {
  checkoutSessionId: string;
  flowId: string;
  sessionId: string;
  teamSlug: string;
  amount: number;
  feeBreakdown: FeeBreakdown | null;
  metadata: Record<string, string>;
}): Promise<void> => {
  try {
    await insertStripePaymentStatus({
      ...args,
      stripePaymentId: checkoutSessionId,
      stripeStatus: "initiated",
    });
  } catch (error) {
    // Expire session if we failed to mark it as "initiated"
    // Otherwise two sessions could remain open at any given time
    await stripe.checkout.sessions
      .expire(checkoutSessionId)
      .catch((expireError) =>
        reportError({
          error: `Could not expire unrecorded Checkout Session ${checkoutSessionId}: ${expireError}`,
          context: { sessionId: args.sessionId },
        }),
      );

    throw new ServerError({
      message: `Could not record initiated Stripe payment for Checkout Session ${checkoutSessionId}`,
      cause: error,
    });
  }
};

export const getStripeCheckoutSessionStatus = async (
  checkoutSessionId: string,
): Promise<CheckoutSessionStatusResponse> => {
  const session = await stripe.checkout.sessions.retrieve(checkoutSessionId);

  const paymentIntentId = getStripeId(session.payment_intent) ?? null;

  return {
    status: session.status,
    paymentStatus: session.payment_status,
    paymentIntentId,
  };
};
