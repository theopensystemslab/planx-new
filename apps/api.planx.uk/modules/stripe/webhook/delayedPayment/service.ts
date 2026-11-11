import { gql } from "graphql-request";
import type Stripe from "stripe";
import { z } from "zod";

import { $api } from "../../../../client/index.js";

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
