import { format, fromUnixTime } from "date-fns";
import { gql } from "graphql-request";
import type Stripe from "stripe";
import { z } from "zod";

import { $api } from "../../../../client/index.js";
import { sendEmail } from "../../../../lib/resend/index.js";
import { reportError } from "../../../pay/helpers.js";
import { stripe } from "../../client.js";
import { alertPlanX, formatPence, getStripeId } from "../../helpers.js";
import { getSessionForPayment } from "../ownership/service.js";

type AsyncPaymentEvent = Pick<Stripe.Event, "id" | "type" | "created">;

const addressSchema = z.object({ _address: z.object({ title: z.string() }) });

interface PaymentOutcomeDetails {
  submittedAt: string | null;
  invoiceEmail: string | null;
  paymentMethod: string | null;
}

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  card: "Card",
  pay_by_bank: "Pay by Bank",
  bacs_debit: "Bacs Direct Debit",
};

const formatPaymentMethod = (paymentMethod: string | null): string =>
  paymentMethod
    ? (PAYMENT_METHOD_LABELS[paymentMethod] ?? paymentMethod)
    : "Not known";

/**
 * Email the council when a delayed payment for a submitted application succeeds
 */
export async function sendPaymentConfirmedEmail(
  checkoutSession: Stripe.Checkout.Session,
  event: AsyncPaymentEvent,
): Promise<void> {
  const context = await getAsyncPaymentContext(checkoutSession, event);
  if (!context) return;

  const { session, details, variables } = context;

  // Applicant did not return to PlanX and hit Send component
  // Possible solutions...
  //  - Submit server side (like ITP)
  //  - Catch in mop up job (like GovPay)
  if (!details.submittedAt) {
    return alertPlanX(
      `:warning: Stripe payment *${variables.paymentReference}* (${variables.paymentMethod}) succeeded, but session ${session.sessionId} has not been submitted [${session.teamSlug}]. No council email sent.`,
    );
  }

  // team.invoice_details.email_address is nullable field
  // TODO: We should enforce this is present before enabling Stripe?
  if (!details.invoiceEmail) {
    return alertPlanX(
      `:warning: Stripe payment *${variables.paymentReference}* (${variables.paymentMethod}) succeeded for session ${session.sessionId}, but the council has no invoice email [${session.teamSlug}]. Tell the council the payment is confirmed.`,
    );
  }

  await sendEmail(
    "payment-confirmed-council",
    details.invoiceEmail,
    {
      ...variables,
      paymentDate: format(fromUnixTime(event.created), "d MMMM yyyy"),
    },
    { idempotencyKey: `payment-confirmed-council-${event.id}` },
  );
}

/**
 * Email the council and the payer when a delayed payment fails
 *
 * TODO: For ITP, should the applicant (usually agent) also be told their nominee's payment failed?
 */
export async function sendPaymentFailedEmails(
  checkoutSession: Stripe.Checkout.Session,
  event: AsyncPaymentEvent,
): Promise<void> {
  const context = await getAsyncPaymentContext(checkoutSession, event);
  if (!context) return;

  const { session, details, variables } = context;

  const payerEmail = checkoutSession.customer_details?.email;

  if (!payerEmail) {
    return reportError({
      error: `Could not email the payer of failed Stripe payment ${variables.paymentReference}`,
      context: { checkoutSessionId: checkoutSession.id, eventId: event.id },
    });
  }

  await sendEmail("payment-failed-payer", payerEmail, variables, {
    idempotencyKey: `payment-failed-payer-${event.id}`,
  });

  if (!details.submittedAt) {
    return alertPlanX(
      `:warning: Stripe payment *${variables.paymentReference}* (${variables.paymentMethod}) failed, but session ${session.sessionId} has not been submitted [${session.teamSlug}]. No council email sent.`,
    );
  }

  if (!details.invoiceEmail) {
    return alertPlanX(
      `:warning: Stripe payment *${variables.paymentReference}* (${variables.paymentMethod}) failed for session ${session.sessionId}, but the council has no invoice email [${session.teamSlug}]. Tell the council to chase the fee.`,
    );
  }

  const failure = await getPaymentFailure(variables.paymentReference);
  await sendEmail(
    "payment-failed-council",
    details.invoiceEmail,
    { ...variables, ...failure },
    { idempotencyKey: `payment-failed-council-${event.id}` },
  );
}

/**
 * Get all context required for async payment emails
 */
async function getAsyncPaymentContext(
  checkoutSession: Stripe.Checkout.Session,
  event: AsyncPaymentEvent,
) {
  const session = await getSessionForPayment(checkoutSession, event.type);
  if (!session) return null;

  const paymentReference = getStripeId(checkoutSession.payment_intent);
  // Should not happen - a completed Checkout Session in "payment" mode always has a PaymentIntent
  if (!paymentReference) {
    throw new Error(
      `Checkout Session ${checkoutSession.id} (${event.type}) has no PaymentIntent`,
    );
  }

  const details = await getPaymentOutcomeDetails(
    session.sessionId,
    paymentReference,
  );
  const address = addressSchema.safeParse(session.passportData);

  return {
    session,
    details,
    variables: {
      serviceName: session.flowName,
      councilName: session.teamName,
      sessionId: session.sessionId,
      address: address.success ? address.data._address.title : "Not provided",
      paymentReference,
      paymentMethod: formatPaymentMethod(details.paymentMethod),
      amount:
        checkoutSession.amount_total === null
          ? "Not provided"
          : formatPence(checkoutSession.amount_total),
    },
  };
}

async function getPaymentOutcomeDetails(
  sessionId: string,
  paymentIntentId: string,
): Promise<PaymentOutcomeDetails> {
  const { session, paymentStatus } = await $api.client.request<{
    session: {
      submittedAt: string | null;
      flow: {
        team: { invoiceDetails: { emailAddress: string | null } | null };
      };
    };
    paymentStatus: { paymentMethod: string }[];
  }>(
    gql`
      query GetPaymentOutcomeDetails(
        $sessionId: uuid!
        $paymentIntentId: String!
      ) {
        session: lowcal_sessions_by_pk(id: $sessionId) {
          submittedAt: submitted_at
          flow {
            team {
              invoiceDetails: invoice_details {
                emailAddress: email_address
              }
            }
          }
        }
        paymentStatus: payment_status(
          where: {
            stripe_payment_id: { _eq: $paymentIntentId }
            payment_method: { _is_null: false }
          }
          order_by: { created_at: desc }
          limit: 1
        ) {
          paymentMethod: payment_method
        }
      }
    `,
    { sessionId, paymentIntentId },
  );

  return {
    submittedAt: session.submittedAt,
    invoiceEmail: session.flow.team.invoiceDetails?.emailAddress ?? null,
    paymentMethod: paymentStatus[0]?.paymentMethod ?? null,
  };
}

async function getPaymentFailure(
  paymentIntentId: string,
): Promise<{ failureCode: string; failureMessage: string }> {
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId, {
    expand: ["latest_charge"],
  });

  const charge =
    typeof paymentIntent.latest_charge === "object"
      ? paymentIntent.latest_charge
      : null;

  return {
    failureCode:
      charge?.failure_code ??
      paymentIntent.last_payment_error?.code ??
      "unknown",
    failureMessage:
      charge?.failure_message ??
      paymentIntent.last_payment_error?.message ??
      "",
  };
}
