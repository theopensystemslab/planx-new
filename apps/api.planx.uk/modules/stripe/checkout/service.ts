import {
  calculateStripeSplit,
  formatStripeMetadata,
  getFeeBreakdown,
} from "@opensystemslab/planx-core";
import type { FeeBreakdown, Session } from "@opensystemslab/planx-core/types";
import { getUnixTime } from "date-fns";
import { gql } from "graphql-request";

import { $api } from "../../../client/index.js";
import { ServerError } from "../../../errors/index.js";
import { reportError } from "../../pay/helpers.js";
import { stripe } from "../client.js";
import { getStripeId } from "../helpers.js";
import { insertStripePaymentStatus } from "../webhook/paymentStatus/service.js";
import { buildLineItems } from "./lineItems.js";
import { getCheckoutSessionExpiry } from "./paymentRequest.js";
import { buildPaymentRequestReturnURL } from "./returnURL.js";
import type {
  CheckoutSessionStatusResponse,
  CreateCheckoutSessionInput,
  CreateCheckoutSessionResponse,
  CreatePaymentRequestCheckoutSessionInput,
} from "./types.js";

const getFeeBreakdownForSession = async (
  sessionId: string,
): Promise<FeeBreakdown> => {
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

  if (!passportData) {
    throw new ServerError({
      status: 422,
      message: `Session ${sessionId} has no passport data to build a fee breakdown from`,
    });
  }

  try {
    return getFeeBreakdown(passportData);
  } catch (error) {
    throw new ServerError({
      status: 422,
      message: `Session ${sessionId} has an invalid fee breakdown`,
      cause: error,
    });
  }
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
 * Keys set by PlanX on every Stripe payment, which the API relies on to link a payment back to its session
 * These always take precedence over Editor-configured metadata
 */
const getReservedPaymentMetadata = (sessionId: string) => ({
  sessionId,
  // Non-prod environments share a Stripe sandbox
  // This identifies which environment owns this payment
  origin: process.env.API_URL_EXT!,
});

interface DestinationChargeCheckoutSessionInput {
  sessionId: string;
  flowId: string;
  teamSlug: string;
  connectedAccountId: string;
  feeBreakdown: FeeBreakdown;
  returnURL: string;
  metadata: Record<string, string>;
  customerEmail?: string;
  expiresAt?: Date;
}

/**
 * Create a Checkout Session for a destination charge to the team's connected account
 *
 * @docs https://docs.stripe.com/connect/destination-charges
 */
const createDestinationChargeCheckoutSession = async ({
  sessionId,
  flowId,
  teamSlug,
  connectedAccountId,
  feeBreakdown,
  returnURL,
  metadata,
  customerEmail,
  expiresAt,
}: DestinationChargeCheckoutSessionInput): Promise<CreateCheckoutSessionResponse> => {
  await expirePreviousCheckoutSessions(sessionId);

  const separator = returnURL.includes("?") ? "&" : "?";

  const lineItems = buildLineItems(feeBreakdown);

  // PlanX's cut (the Stripe application fee)
  const split = calculateStripeSplit(feeBreakdown);
  // 0 is not a valid fee for Stripe, must be undefined if there's no fee amount
  const applicationFeeAmount = split.applicationFeeAmount || undefined;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    // TODO: Configure payment types
    payment_method_types: ["card"],
    line_items: lineItems,
    success_url: `${returnURL}${separator}stripeSessionId={CHECKOUT_SESSION_ID}`,
    cancel_url: `${returnURL}${separator}cancelled=true`,
    customer_email: customerEmail,
    expires_at: expiresAt && getUnixTime(expiresAt),
    metadata,
    payment_intent_data: {
      on_behalf_of: connectedAccountId,
      transfer_data: { destination: connectedAccountId },
      application_fee_amount: applicationFeeAmount,
      // PaymentIntent metadata is returned when the webhook is hit by Stripe
      metadata,
    },
  });

  await recordInitiatedPayment({
    checkoutSessionId: session.id,
    flowId,
    sessionId,
    teamSlug,
    amount: session.amount_total ?? split.amount,
    feeBreakdown,
    metadata,
  });

  return { url: session.url };
};

/**
 * Create a Stripe Checkout Session for an applicant paying for their own session
 */
export const createStripeCheckoutSession = async ({
  sessionId,
  flowId,
  returnURL,
  teamSlug,
  connectedAccountId,
  metadata,
}: CreateCheckoutSessionInput): Promise<CreateCheckoutSessionResponse> => {
  const feeBreakdown = await getFeeBreakdownForSession(sessionId);

  return createDestinationChargeCheckoutSession({
    sessionId,
    flowId,
    teamSlug,
    connectedAccountId,
    feeBreakdown,
    returnURL,
    metadata: { ...metadata, ...getReservedPaymentMetadata(sessionId) },
  });
};

/**
 * Create a Stripe Checkout Session for a nominated payee paying an ITP request
 */
export const createPaymentRequestStripeCheckoutSession = async ({
  paymentRequest,
  connectedAccountId,
}: CreatePaymentRequestCheckoutSessionInput): Promise<CreateCheckoutSessionResponse> => {
  const { id, sessionId, session, feeBreakdown } = paymentRequest;

  if (!feeBreakdown) {
    throw new ServerError({
      status: 422,
      message: `Payment request ${id} has no fee breakdown`,
    });
  }

  const formattedMetadata = formatStripeMetadata({
    metadata: paymentRequest.metadata,
    userPassport: session.passport,
    paidViaInviteToPay: true,
  });

  return createDestinationChargeCheckoutSession({
    sessionId,
    flowId: session.flowId,
    teamSlug: session.flow.team.slug,
    connectedAccountId,
    feeBreakdown,
    returnURL: buildPaymentRequestReturnURL(session.flow, id),
    metadata: {
      ...formattedMetadata,
      paidViaInviteToPay: "true",
      ...getReservedPaymentMetadata(sessionId),
    },
    customerEmail: paymentRequest.payeeEmail,
    expiresAt: getCheckoutSessionExpiry(paymentRequest.expiresAt, new Date()),
  });
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
  feeBreakdown: FeeBreakdown;
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
