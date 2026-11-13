import type { Passport } from "@opensystemslab/planx-core/types";
import { gql } from "graphql-request";

import { $api } from "../../../client/index.js";
import { getPaymentRequest } from "../checkout/paymentRequest.js";
import { stripe } from "../client.js";
import {
  getStripeId,
  postStripePaymentNotificationToSlack,
} from "../helpers.js";
import { isDelayedPaymentPending } from "../webhook/delayedPayment/service.js";
import {
  type FulfilmentResult,
  paymentRequestCheckoutMetadataSchema,
  STRIPE_PASSPORT_KEY,
} from "./types.js";

/**
 * Mark an ITP request as paid, once Stripe confirms its Checkout Session has been paid
 *
 * paid_at always means paid. A delayed payment method (e.g. Bacs Direct Debit) completes Checkout as
 * "unpaid" and succeeds or fails days later - until then the request is "pending", and it's fulfilled
 * from the checkout.session.async_payment_succeeded webhook.
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

  // Paid by this Checkout Session, or another (e.g. in a second tab)
  if (paymentRequest.paidAt) {
    return {
      status: "alreadyFulfilled",
      stripePaymentId: paymentRequest.stripePaymentId,
    };
  }

  const isPending = isDelayedPaymentPending(checkoutSession);
  // Checkout hasn't been completed
  if (!isPending && checkoutSession.payment_status !== "paid") {
    return { status: "unpaid" };
  }

  const stripePaymentId = getStripeId(checkoutSession.payment_intent);
  // Should not happen - a completed Checkout Session in "payment" mode always has a PaymentIntent
  if (!stripePaymentId) {
    throw new Error(
      `Completed Checkout Session ${checkoutSessionId} has no PaymentIntent`,
    );
  }

  // A delayed payment (e.g. Bacs) is fulfilled once it succeeds
  if (isPending) return { status: "pending", stripePaymentId };

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
    };
  }

  // Send an ITP Slack notification when we mark a payment request as paid
  await postStripePaymentNotificationToSlack(
    paymentRequest.session.flow.team.slug,
    stripePaymentId,
    "succeeded",
    true,
  );

  return { status: "fulfilled", stripePaymentId };
}

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
