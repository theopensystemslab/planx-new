import { addDays, format } from "date-fns";
import { gql } from "graphql-request";
import type Stripe from "stripe";
import { z } from "zod";

import { $api } from "../../../../client/index.js";
import {
  getCouncilFromAddress,
  sendEmail,
} from "../../../../lib/resend/index.js";
import { reportError } from "../../../pay/helpers.js";
import {
  DAYS_UNTIL_EXPIRY,
  getResumeLink,
} from "../../../saveAndReturn/service/utils.js";
import { rescheduleSessionEmailEvents } from "../../../webhooks/service/lowcalSessionEvents/index.js";
import {
  getPaymentRequest,
  getPaymentRequestExpiry,
} from "../../checkout/paymentRequest.js";
import { buildPaymentRequestReturnURL } from "../../checkout/returnURL.js";
import { formatPence, getStripeId } from "../../helpers.js";
import type { PaymentSession } from "../ownership/service.js";
import {
  formatSiteAddress,
  getCouncilEmailDetails,
} from "../paymentConfirmation/service.js";

/**
 * Reserved metadata set by PlanX on every Checkout Session - paymentRequestId only for invite to pay
 */
const checkoutMetadataSchema = z.object({
  sessionId: z.uuid(),
  origin: z.string(),
  paymentRequestId: z.uuid().optional(),
});

interface FailedPaymentSession {
  email: string;
  createdAt: string;
  hasUserSaved: boolean;
  delayedPaymentStartedAt: string | null;
  submittedAt: string | null;
  deletedAt: string | null;
  passportData: PaymentSession["passportData"];
  flow: {
    slug: string;
    name: string;
    team: { name: string; slug: string; domain: string | null };
  };
}

const getFailedPaymentSession = async (
  sessionId: string,
): Promise<FailedPaymentSession | null> => {
  const { session } = await $api.client.request<{
    session: FailedPaymentSession | null;
  }>(
    gql`
      query GetFailedPaymentSession($sessionId: uuid!) {
        session: lowcal_sessions_by_pk(id: $sessionId) {
          email
          createdAt: created_at
          hasUserSaved: has_user_saved
          delayedPaymentStartedAt: delayed_payment_started_at
          submittedAt: submitted_at
          deletedAt: deleted_at
          passportData: data(path: "passport.data")
          flow {
            slug
            name
            team {
              name
              slug
              domain
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
 * Unlock a self-pay session after its delayed payment failed, so the applicant can resume it and pay again
 */
const unlockSession = async (sessionId: string): Promise<void> => {
  await $api.client.request(
    gql`
      mutation UnlockSessionAfterFailedPayment($sessionId: uuid!) {
        update_lowcal_sessions(
          where: {
            id: { _eq: $sessionId }
            locked_at: { _is_null: false }
            submitted_at: { _is_null: true }
            deleted_at: { _is_null: true }
          }
          _set: { locked_at: null }
        ) {
          affected_rows
        }
      }
    `,
    { sessionId },
  );
};

/**
 *  Self-pay: unlock the session, so the applicant can resume it at Pay - 28 days from when the first delayed payment started
 *  Invite to pay: the session stays locked, and the invitee can pay again from the payment request until it expires
 */
const prepareToPayAgain = async (
  sessionId: string,
  session: FailedPaymentSession,
  paymentRequestId: string | undefined,
): Promise<{ payLink: string; payBy: Date } | null> => {
  if (paymentRequestId) {
    const paymentRequest = await getPaymentRequest(paymentRequestId);
    if (!paymentRequest) return null;

    return {
      payLink: buildPaymentRequestReturnURL(session.flow, paymentRequestId),
      payBy: getPaymentRequestExpiry(paymentRequest.createdAt),
    };
  }

  const windowStart = new Date(
    session.delayedPaymentStartedAt ?? session.createdAt,
  );

  await unlockSession(sessionId);

  // Save & return emails now count down to the end of the window to pay, not 28 days from when the session was created
  if (session.hasUserSaved) {
    await rescheduleSessionEmailEvents({
      from: windowStart,
      payload: { sessionId, email: session.email },
    });
  }

  return {
    payLink: getResumeLink(
      { id: sessionId },
      session.flow.team,
      session.flow.slug,
    ),
    payBy: addDays(windowStart, DAYS_UNTIL_EXPIRY),
  };
};

/**
 * A delayed payment (e.g. Bacs Direct Debit) has failed - nothing has been submitted, and the council isn't told
 * Let the payer pay again, and email them a link to do so (council branding)
 *
 * Called from the checkout.session.async_payment_failed webhook, so it must be safe to re-run
 * Throws errors to make Stripe redeliver the event - the idempotency key stops a redelivery sending a duplicate email
 *
 * @docs https://docs.stripe.com/checkout/fulfillment#delayed-notification
 */
export async function handleDelayedPaymentFailed(
  checkoutSession: Pick<
    Stripe.Checkout.Session,
    "id" | "metadata" | "payment_intent" | "amount_total" | "customer_details"
  >,
): Promise<void> {
  const metadata = checkoutMetadataSchema.safeParse(checkoutSession.metadata);
  if (!metadata.success) return;

  const { sessionId, origin, paymentRequestId } = metadata.data;

  // Non-prod environments share a Stripe sandbox
  // Only the environment which created the payment handles it
  if (origin !== process.env.API_URL_EXT) return;

  const session = await getFailedPaymentSession(sessionId);
  // this check will catch events from different local environments
  if (!session) return;

  const stripePaymentId = getStripeId(checkoutSession.payment_intent) ?? "";

  // Too late to pay again - the session can't be resumed
  if (session.deletedAt || session.submittedAt) {
    return console.info(
      `Delayed payment ${stripePaymentId} failed for session ${sessionId}, which can no longer be paid (${session.deletedAt ? "expired" : "submitted"})`,
    );
  }

  const payAgain = await prepareToPayAgain(
    sessionId,
    session,
    paymentRequestId,
  );
  if (!payAgain) return;

  const payerEmail = checkoutSession.customer_details?.email;
  if (!payerEmail) {
    return reportError({
      error:
        "Could not email the payer of a failed delayed payment: no payer email found on the Checkout Session",
      context: { checkoutSessionId: checkoutSession.id, sessionId },
    });
  }

  const council = await getCouncilEmailDetails(session.flow.team.slug);

  await sendEmail(
    "payment-failed-payer",
    payerEmail,
    {
      serviceName: session.flow.name,
      councilName: session.flow.team.name,
      sessionId,
      address: formatSiteAddress(session.passportData),
      paymentReference: stripePaymentId,
      amount: formatPence(checkoutSession.amount_total ?? 0),
      councilLogo: council.logo ?? "",
      councilPrimaryColour: council.primaryColour ?? "",
      payLink: payAgain.payLink,
      payByDate: format(payAgain.payBy, "d MMMM yyyy"),
    },
    {
      idempotencyKey: `payment-failed-payer-${stripePaymentId || checkoutSession.id}`,
      from: getCouncilFromAddress(session.flow.team.name),
      replyTo: council.helpEmail ?? undefined,
    },
  );
}
