import type { Passport } from "@opensystemslab/planx-core/types";
import { gql } from "graphql-request";
import type Stripe from "stripe";
import { z } from "zod";

import { $api } from "../../../../client/index.js";
import { reportError } from "../../../pay/helpers.js";
import { createPaymentSendEventsForSession } from "../../../pay/service/inviteToPay/createPaymentSendEvents.js";
import { STRIPE_PASSPORT_KEY } from "../../fulfilment/types.js";

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

/**
 * Payment methods which complete Checkout before the payment has succeeded
 * The application is submitted once the payment succeeds
 * Stored in payment_status.payment_method
 */
export const DELAYED_PAYMENT_METHODS: readonly string[] = ["bacs_debit"];

interface DelayedPaymentSession {
  passport: Passport | null;
  submittedAt: string | null;
  deletedAt: string | null;
  paymentRequests: { id: string }[];
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
          submittedAt: submitted_at
          deletedAt: deleted_at
          paymentRequests: payment_requests(limit: 1) {
            id
          }
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
 * Write the payment reference into the session so it's in place before the application is submitted
 */
const writePaymentReference = async ({
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
      mutation WriteDelayedPaymentReference(
        $sessionId: uuid!
        $sessionData: jsonb!
      ) {
        session: update_lowcal_sessions(
          where: { id: { _eq: $sessionId }, deleted_at: { _is_null: true } }
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

export type SubmitDelayedPaymentResult =
  | "submitted"
  | "notSucceeded"
  | "notDelayed"
  | "inviteToPay"
  | "notSubmittable";

/**
 * Submit a self-pay application once its delayed payment (e.g. Bacs) has succeeded
 * Called by the `delayed_payment_send_events` trigger on every payment_status insert
 * Throws errors to make Hasura retry the event
 */
export async function submitDelayedPayment({
  sessionId,
  stripePaymentId,
  stripeStatus,
  paymentMethod,
  isRetry,
}: {
  sessionId: string;
  stripePaymentId: string;
  stripeStatus: string;
  paymentMethod: string | null;
  isRetry: boolean;
}): Promise<SubmitDelayedPaymentResult> {
  if (stripeStatus !== "succeeded") return "notSucceeded";
  if (!paymentMethod || !DELAYED_PAYMENT_METHODS.includes(paymentMethod)) {
    return "notDelayed";
  }

  const session = await getDelayedPaymentSession(sessionId);
  // Should not happen - payment_status rows are only recorded for sessions in this environment
  if (!session) {
    reportError({
      error: `Delayed payment ${stripePaymentId} succeeded, but session ${sessionId} was not found. The application has not been submitted - needs following up manually.`,
      context: { stripePaymentId, sessionId },
    });
    return "notSubmittable";
  }

  if (session.paymentRequests.length) return "inviteToPay";

  const payment = `Stripe payment ${stripePaymentId}`;
  const team = session.flow.team.slug;

  // The 28-day window to pay ran out while the payment was processing
  if (session.deletedAt) {
    reportError({
      error: `${payment} succeeded, but session ${sessionId} has expired [${team}]. The application has not been submitted - needs following up manually.`,
      context: { stripePaymentId, sessionId },
    });
    return "notSubmittable";
  }

  // Should not happen on the first attempt - the session is locked while the payment is processing
  if (session.submittedAt && !isRetry) {
    reportError({
      error: `${payment} succeeded, but session ${sessionId} was already submitted [${team}]. The applicant may have paid twice - needs following up manually.`,
      context: { stripePaymentId, sessionId },
    });
    return "notSubmittable";
  }

  const affectedRows = await writePaymentReference({
    sessionId,
    stripePaymentId,
    passport: session.passport,
  });
  // Expired since we read the session - retry, to report it
  if (!affectedRows) {
    throw new Error(
      `Could not write payment reference ${stripePaymentId} to session ${sessionId} - it has been deleted`,
    );
  }

  await createPaymentSendEventsForSession(sessionId);

  console.info(
    `Delayed payment ${stripePaymentId} succeeded: submitting session ${sessionId}`,
  );
  return "submitted";
}
