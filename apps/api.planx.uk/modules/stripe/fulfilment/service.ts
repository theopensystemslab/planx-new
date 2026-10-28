import type { Passport } from "@opensystemslab/planx-core/types";
import { gql } from "graphql-request";
import type Stripe from "stripe";

import { $api } from "../../../client/index.js";
import { getPaymentRequest } from "../checkout/paymentRequest.js";
import { stripe } from "../client.js";
import {
  getStripeId,
  postStripePaymentNotificationToSlack,
} from "../helpers.js";
import {
  type FulfilledPaymentStatus,
  type FulfilmentResult,
  paymentRequestCheckoutMetadataSchema,
  STRIPE_PASSPORT_KEY,
} from "./types.js";

/**
 * Mark an ITP request as paid, once Stripe confirms its Checkout Session has been paid or authorised
 *
 * paid_at means "payment authorised", not "funds received".
 *
 * A delayed payment method (e.g. Bacs Direct Debit) completes Checkout as "unpaid", and confirms or
 * fails days later. The application submits at authorisation, and the council chases a failed payment.
 *
 * Called from both the webhook and the payer's return page, so it must be safe to run any number of
 * times, concurrently. The Checkout Session is always re-read from Stripe, never trusted from the caller.
 *
 * Setting paid_at fires the `setup_payment_send_events` event trigger, which submits the application via
 * the methods configured in the Pay component
 *
 * @docs https://docs.stripe.com/checkout/fulfillment
 */
export async function fulfilPaymentRequest(
  checkoutSessionId: string,
  { expectedPaymentRequestId }: { expectedPaymentRequestId?: string } = {},
): Promise<FulfilmentResult> {
  const checkoutSession =
    await stripe.checkout.sessions.retrieve(checkoutSessionId);

  const metadata = paymentRequestCheckoutMetadataSchema.safeParse(
    checkoutSession.metadata,
  );
  if (!metadata.success) return { status: "notPaymentRequest" };

  const { sessionId, origin, paymentRequestId } = metadata.data;

  if (
    expectedPaymentRequestId &&
    expectedPaymentRequestId !== paymentRequestId
  ) {
    return { status: "mismatch" };
  }

  // Non-prod environments share a Stripe sandbox
  // Only the environment which created the payment fulfils it
  if (origin !== process.env.API_URL_EXT) return { status: "foreign" };

  const paymentRequest = await getPaymentRequest(paymentRequestId);
  // Local environments share a single origin, so a matching origin alone can't prove the request is ours
  if (!paymentRequest?.session) return { status: "notFound" };

  if (paymentRequest.sessionId !== sessionId) return { status: "mismatch" };

  if (paymentRequest.paidAt) {
    return {
      status: "alreadyFulfilled",
      stripePaymentId: paymentRequest.stripePaymentId,
      paymentStatus: getStoredPaymentStatus(
        checkoutSession,
        paymentRequest.stripePaymentId,
      ),
    };
  }

  const paymentStatus = getFulfilledPaymentStatus(checkoutSession);
  // Checkout hasn't been completed
  if (!paymentStatus) return { status: "unpaid" };

  const stripePaymentId = getStripeId(checkoutSession.payment_intent);
  // Should not happen - a completed Checkout Session in "payment" mode always has a PaymentIntent
  if (!stripePaymentId) {
    throw new Error(
      `Completed Checkout Session ${checkoutSessionId} has no PaymentIntent`,
    );
  }

  const affectedRows = await markPaymentRequestAsPaid({
    paymentRequestId,
    sessionId,
    stripePaymentId,
    passport: paymentRequest.session.passport,
  });

  // A concurrent call got there first
  if (!affectedRows) {
    const paidRequest = await getPaymentReference(paymentRequestId);
    if (!paidRequest) return { status: "notFound" };

    return {
      status: "alreadyFulfilled",
      stripePaymentId: paidRequest.stripePaymentId,
      paymentStatus: getStoredPaymentStatus(
        checkoutSession,
        paidRequest.stripePaymentId,
      ),
    };
  } else {
    // Send an ITP Slack notification when we mark a payment request as paid
    await postStripePaymentNotificationToSlack(
      paymentRequest.session.flow.team.slug,
      stripePaymentId,
      paymentStatus === "paid" ? "succeeded" : "processing",
      true,
    );
  }

  return { status: "fulfilled", stripePaymentId, paymentStatus };
}

/**
 * A completed Checkout Session is "paid", or "pending" (complete + unpaid) while a delayed payment method confirms
 *
 * @docs https://docs.stripe.com/checkout/fulfillment
 */
const getFulfilledPaymentStatus = (
  checkoutSession: Stripe.Checkout.Session,
): FulfilledPaymentStatus | undefined => {
  if (checkoutSession.payment_status === "paid") return "paid";
  if (
    checkoutSession.status === "complete" &&
    checkoutSession.payment_status === "unpaid"
  ) {
    return "pending";
  }
};

const getStoredPaymentStatus = (
  checkoutSession: Stripe.Checkout.Session,
  storedPaymentId: string | null,
): FulfilledPaymentStatus => {
  const checkoutPaymentId = getStripeId(checkoutSession.payment_intent);

  // The request was paid by another Checkout Session (e.g. in a second tab)
  // We only know the status of this Checkout Session, so report the request as paid
  const isPaidByAnotherCheckoutSession = checkoutPaymentId !== storedPaymentId;
  if (isPaidByAnotherCheckoutSession) return "paid";

  const checkoutPaymentStatus = getFulfilledPaymentStatus(checkoutSession);
  if (checkoutPaymentStatus === "pending") return "pending";

  return "paid";
};

/**
 * Read only the payment reference, without the session data getPaymentRequest returns
 */
async function getPaymentReference(
  paymentRequestId: string,
): Promise<{ stripePaymentId: string | null } | null> {
  const { paymentRequest } = await $api.client.request<{
    paymentRequest: { stripePaymentId: string | null } | null;
  }>(
    gql`
      query GetPaymentRequestStripePaymentId($paymentRequestId: uuid!) {
        paymentRequest: payment_requests_by_pk(id: $paymentRequestId) {
          stripePaymentId: stripe_payment_id
        }
      }
    `,
    { paymentRequestId },
  );

  return paymentRequest;
}

interface MarkPaymentRequestAsPaidResponse {
  paymentRequest: { affectedRows: number };
}

/**
 * Set paid_at and write the payment reference into the session in one transaction,
 * so the reference is in place before the paid_at trigger submits the application
 *
 * paid_at means "payment authorised" - it is set for a pending payment too
 */
async function markPaymentRequestAsPaid({
  paymentRequestId,
  sessionId,
  stripePaymentId,
  passport,
}: {
  paymentRequestId: string;
  sessionId: string;
  stripePaymentId: string;
  passport?: Passport;
}): Promise<number> {
  const { paymentRequest } =
    await $api.client.request<MarkPaymentRequestAsPaidResponse>(
      gql`
        mutation MarkStripePaymentRequestAsPaid(
          $paymentRequestId: uuid!
          $sessionId: uuid!
          $stripePaymentId: String!
          $sessionData: jsonb!
        ) {
          paymentRequest: update_payment_requests(
            where: {
              id: { _eq: $paymentRequestId }
              paid_at: { _is_null: true }
            }
            _set: { paid_at: "now()", stripe_payment_id: $stripePaymentId }
          ) {
            affectedRows: affected_rows
          }
          session: update_lowcal_sessions_by_pk(
            pk_columns: { id: $sessionId }
            _append: { data: $sessionData }
          ) {
            id
          }
        }
      `,
      {
        paymentRequestId,
        sessionId,
        stripePaymentId,
        sessionData: {
          passport: {
            ...passport,
            data: { ...passport?.data, [STRIPE_PASSPORT_KEY]: stripePaymentId },
          },
        },
      },
    );

  return paymentRequest.affectedRows;
}
