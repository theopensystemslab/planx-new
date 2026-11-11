import type { Passport } from "@opensystemslab/planx-core/types";
import { gql } from "graphql-request";
import type Stripe from "stripe";
import { z } from "zod";

import { $api } from "../../../../client/index.js";
import { reportError } from "../../../pay/helpers.js";
import { STRIPE_PASSPORT_KEY } from "../../fulfilment/types.js";
import { getStripeId } from "../../helpers.js";

/**
 * Reserved metadata set by PlanX on a self-pay Checkout Session (no paymentRequestId)
 */
const selfPayCheckoutMetadataSchema = z.object({
  sessionId: z.uuid(),
  origin: z.string(),
  paymentRequestId: z.never().optional(),
});

/**
 * Checkout is complete, but a delayed payment method (e.g. Bacs Direct Debit) hasn't confirmed the payment yet
 *
 * @docs https://docs.stripe.com/checkout/fulfillment#delayed-notification
 */
export const isDelayedPaymentPending = ({
  status,
  payment_status,
}: Pick<Stripe.Checkout.Session, "status" | "payment_status">): boolean =>
  status === "complete" && payment_status === "unpaid";

/**
 * The PlanX session a self-pay Checkout Session belongs to, if it was created by this environment
 *
 * Invite to pay Checkout Sessions are skipped - their session is already locked by the payment request
 */
const getSelfPaySessionId = (
  checkoutSession: Pick<Stripe.Checkout.Session, "metadata">,
): string | undefined => {
  const metadata = selfPayCheckoutMetadataSchema.safeParse(
    checkoutSession.metadata,
  );
  if (!metadata.success) return;

  // Non-prod environments share a Stripe sandbox
  // Only the environment which created the payment handles it
  if (metadata.data.origin !== process.env.API_URL_EXT) return;

  return metadata.data.sessionId;
};

interface MarkDelayedPaymentPendingResponse {
  started: { affectedRows: number };
  locked: { affectedRows: number };
}

/**
 * Lock a self-pay session while its delayed payment (e.g. Bacs) is processing, and record when the first one started
 *
 * The application is only submitted once the payment succeeds - until then, the session can't be edited or resumed.
 * If the payment fails, the session is unlocked so the applicant can pay again, for 28 days from the first delayed payment.
 *
 * Only call for a Checkout Session where isDelayedPaymentPending() is true
 * Called from both the webhook and the applicant's return to PlanX, so it must be idempotent
 */
export async function markDelayedPaymentPending(
  checkoutSession: Pick<Stripe.Checkout.Session, "id" | "metadata">,
): Promise<void> {
  const sessionId = getSelfPaySessionId(checkoutSession);
  if (!sessionId) return;

  // Set the start date first - the lock fires the `reset_lowcal_delete_events` trigger, which schedules
  // the session's deletion from it
  const { started, locked } =
    await $api.client.request<MarkDelayedPaymentPendingResponse>(
      gql`
        mutation MarkDelayedPaymentPending($sessionId: uuid!) {
          started: update_lowcal_sessions(
            where: {
              id: { _eq: $sessionId }
              delayed_payment_started_at: { _is_null: true }
              submitted_at: { _is_null: true }
              deleted_at: { _is_null: true }
            }
            _set: { delayed_payment_started_at: "now()" }
          ) {
            affectedRows: affected_rows
          }
          locked: update_lowcal_sessions(
            where: {
              id: { _eq: $sessionId }
              locked_at: { _is_null: true }
              submitted_at: { _is_null: true }
              deleted_at: { _is_null: true }
            }
            _set: { locked_at: "now()" }
          ) {
            affectedRows: affected_rows
          }
        }
      `,
      { sessionId },
    );

  if (locked.affectedRows) {
    console.info(
      `Locked session ${sessionId} while the delayed payment for Checkout Session ${checkoutSession.id} is processing${started.affectedRows ? " (first delayed payment)" : ""}`,
    );
  }
}

interface DelayedPaymentSession {
  passport: Passport | null;
  paidAt: string | null;
  submittedAt: string | null;
  deletedAt: string | null;
  flow: { team: { slug: string } };
}

const getDelayedPaymentSession = async (
  sessionId: string,
): Promise<DelayedPaymentSession | null> => {
  const { session } = await $api.client.request<{
    session: DelayedPaymentSession | null;
  }>(
    gql`
      query GetDelayedPaymentSession($sessionId: uuid!) {
        session: lowcal_sessions_by_pk(id: $sessionId) {
          passport: data(path: "passport")
          paidAt: paid_at
          submittedAt: submitted_at
          deletedAt: deleted_at
          flow {
            team {
              slug
            }
          }
        }
      }
    `,
    { sessionId },
  );

  return session;
};

/**
 * Set paid_at and write the payment reference into the session in one transaction,
 * so the reference is in place before the paid_at trigger submits the application
 */
const markSessionAsPaid = async ({
  sessionId,
  stripePaymentId,
  passport,
}: {
  sessionId: string;
  stripePaymentId: string;
  passport: Passport | null;
}): Promise<number> => {
  const { session } = await $api.client.request<{
    session: { affectedRows: number };
  }>(
    gql`
      mutation MarkSessionAsPaid($sessionId: uuid!, $sessionData: jsonb!) {
        session: update_lowcal_sessions(
          where: {
            id: { _eq: $sessionId }
            paid_at: { _is_null: true }
            submitted_at: { _is_null: true }
            deleted_at: { _is_null: true }
          }
          _set: { paid_at: "now()" }
          _append: { data: $sessionData }
        ) {
          affectedRows: affected_rows
        }
      }
    `,
    {
      sessionId,
      sessionData: {
        passport: {
          ...passport,
          data: { ...passport?.data, [STRIPE_PASSPORT_KEY]: stripePaymentId },
        },
      },
    },
  );

  return session.affectedRows;
};

/**
 * Submit a self-pay application once its delayed payment (e.g. Bacs) has succeeded
 *
 * Writes the payment reference and sets paid_at - the `setup_session_payment_send_events` trigger on paid_at
 * then submits the application, the same as invite to pay. paid_at always means paid
 *
 * Called from the checkout.session.async_payment_succeeded webhook, so it must be idempotent
 */
export async function fulfilDelayedPayment(
  checkoutSession: Pick<
    Stripe.Checkout.Session,
    "id" | "metadata" | "payment_status" | "payment_intent"
  >,
): Promise<void> {
  const sessionId = getSelfPaySessionId(checkoutSession);
  if (!sessionId) return;

  // Should not happen - Stripe only sends async_payment_succeeded for a paid Checkout Session
  if (checkoutSession.payment_status !== "paid") {
    return reportError({
      error: `Delayed payment succeeded, but Checkout Session ${checkoutSession.id} is ${checkoutSession.payment_status}`,
      context: { checkoutSessionId: checkoutSession.id, sessionId },
    });
  }

  const stripePaymentId = getStripeId(checkoutSession.payment_intent);
  // Should not happen - a completed Checkout Session in "payment" mode always has a PaymentIntent
  if (!stripePaymentId) {
    throw new Error(
      `Paid Checkout Session ${checkoutSession.id} has no PaymentIntent`,
    );
  }

  const session = await getDelayedPaymentSession(sessionId);
  // Local environments share a single origin, so a matching origin alone can't prove the session is ours
  if (!session) {
    return console.info(
      `Ignoring delayed payment ${stripePaymentId}: session ${sessionId} not found`,
    );
  }

  if (session.paidAt) {
    return console.info(
      `Ignoring delayed payment ${stripePaymentId}: session ${sessionId} has already been paid`,
    );
  }

  const payment = `Stripe payment ${stripePaymentId}`;
  const team = session.flow.team.slug;

  // The 28-day window to pay ran out while the payment was processing
  if (session.deletedAt) {
    return reportError({
      error: `${payment} succeeded, but session ${sessionId} has expired [${team}]. The application has not been submitted - needs following up manually.`,
      context: { stripePaymentId, sessionId },
    });
  }

  // Should not happen - the session is locked while the payment is processing
  if (session.submittedAt) {
    return reportError({
      error: `${payment} succeeded, but session ${sessionId} was already submitted [${team}]. The applicant may have paid twice - needs following up manually.`,
      context: { stripePaymentId, sessionId },
    });
  }

  const affectedRows = await markSessionAsPaid({
    sessionId,
    stripePaymentId,
    passport: session.passport,
  });

  // A concurrent call got there first
  if (!affectedRows) return;

  console.info(
    `Delayed payment ${stripePaymentId} succeeded: submitting session ${sessionId}`,
  );
}
