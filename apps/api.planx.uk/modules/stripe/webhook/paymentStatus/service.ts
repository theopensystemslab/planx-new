import { getFeeBreakdown } from "@opensystemslab/planx-core";
import type { FeeBreakdown, Session } from "@opensystemslab/planx-core/types";
import { gql } from "graphql-request";
import type Stripe from "stripe";

import { $api } from "../../../../client/index.js";
import { reportError } from "../../../pay/helpers.js";
import { getOwnedPaymentIntent } from "../ownership/service.js";
import { hasuraClientErrorSchema } from "./types.js";

type StripePaymentStatus =
  "created" | "processing" | "succeeded" | "payment_failed";

interface InsertStripePaymentStatusArgs {
  flowId: string;
  sessionId: string;
  teamSlug: string;
  stripePaymentId: string;
  stripeStatus: StripePaymentStatus;
  amount: number;
  feeBreakdown?: FeeBreakdown | null;
  metadata: Stripe.Metadata;
}

export async function recordStripePaymentIntentStatus(
  paymentIntent: Stripe.PaymentIntent,
  stripeStatus: StripePaymentStatus,
): Promise<void> {
  const { id, amount, metadata } = paymentIntent;

  const ownedPaymentIntent = await getOwnedPaymentIntent(
    paymentIntent,
    stripeStatus,
  );
  if (!ownedPaymentIntent) return;

  const { sessionId, flowId, teamSlug } = ownedPaymentIntent.metadata;
  const feeBreakdown = deriveFeeBreakdown(
    sessionId,
    ownedPaymentIntent.passportData,
  );

  try {
    await insertStripePaymentStatus({
      flowId,
      sessionId,
      teamSlug,
      stripePaymentId: id,
      stripeStatus,
      amount,
      feeBreakdown,
      metadata,
    });
  } catch (error) {
    if (isForeignKeyViolation(error)) {
      console.info(
        `Ignoring Stripe event for PaymentIntent ${id} (${stripeStatus}): flow ${flowId} or team ${teamSlug} no longer exists`,
      );
      return;
    }
    throw error;
  }
}

const isForeignKeyViolation = (error: unknown): boolean => {
  const parsed = hasuraClientErrorSchema.safeParse(error);
  if (!parsed.success) return false;

  return parsed.data.response.errors.some(
    ({ message, extensions }) =>
      extensions.code === "constraint-violation" &&
      message.startsWith("Foreign key violation"),
  );
};

function deriveFeeBreakdown(
  sessionId: string,
  passportData: Session["data"]["passport"]["data"] | undefined,
): FeeBreakdown | null {
  if (!passportData) return null;

  try {
    return getFeeBreakdown(passportData);
  } catch (error) {
    reportError({
      error: `Could not derive fee breakdown for Stripe payment status: ${error}`,
      context: { sessionId },
    });
    return null;
  }
}

async function insertStripePaymentStatus({
  flowId,
  sessionId,
  teamSlug,
  stripePaymentId,
  stripeStatus,
  amount,
  feeBreakdown,
  metadata,
}: InsertStripePaymentStatusArgs): Promise<void> {
  await $api.client.request(
    gql`
      mutation InsertStripePaymentStatus(
        $flowId: uuid!
        $sessionId: uuid!
        $teamSlug: String!
        $stripePaymentId: String!
        $stripeStatus: stripe_payment_status_enum_enum!
        $amount: Int
        $feeBreakdown: jsonb
        $metadata: jsonb
      ) {
        insert_payment_status(
          objects: {
            flow_id: $flowId
            session_id: $sessionId
            team_slug: $teamSlug
            stripe_payment_id: $stripePaymentId
            stripe_status: $stripeStatus
            amount: $amount
            fee_breakdown: $feeBreakdown
            stripe_metadata: $metadata
          }
        ) {
          affected_rows
        }
      }
    `,
    {
      flowId,
      sessionId,
      teamSlug,
      stripePaymentId,
      stripeStatus,
      amount,
      feeBreakdown,
      metadata,
    },
  );
}
