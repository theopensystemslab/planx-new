import { getFeeBreakdown } from "@opensystemslab/planx-core";
import type { FeeBreakdown, Session } from "@opensystemslab/planx-core/types";
import { gql } from "graphql-request";
import type Stripe from "stripe";

import { $api } from "../../../../client/index.js";
import { reportError } from "../../../pay/helpers.js";
import { stripePaymentMetadataSchema } from "./types.js";

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
}

export async function recordStripePaymentIntentStatus(
  paymentIntent: Stripe.PaymentIntent,
  stripeStatus: StripePaymentStatus,
): Promise<void> {
  const { id, amount, metadata } = paymentIntent;

  const parsedMetadata = stripePaymentMetadataSchema.safeParse(metadata);
  if (!parsedMetadata.success) {
    reportError({
      error:
        "Could not record Stripe payment status: PaymentIntent metadata is invalid or missing",
      context: {
        paymentIntentId: id,
        stripeStatus,
        issues: parsedMetadata.error.issues,
      },
    });
    return;
  }
  const { sessionId, flowId, teamSlug } = parsedMetadata.data;

  const feeBreakdown = await getFeeBreakdownForSession(sessionId);

  await insertStripePaymentStatus({
    flowId,
    sessionId,
    teamSlug,
    stripePaymentId: id,
    stripeStatus,
    amount,
    feeBreakdown,
  });
}

async function getFeeBreakdownForSession(
  sessionId: string,
): Promise<FeeBreakdown | null> {
  try {
    const response = await $api.client.request<{
      session: Partial<{
        passportData: Session["data"]["passport"]["data"];
      }> | null;
    }>(
      gql`
        query GetSessionPassportData($id: uuid!) {
          session: lowcal_sessions_by_pk(id: $id) {
            passportData: data(path: "passport.data")
          }
        }
      `,
      { id: sessionId },
    );

    const passportData = response?.session?.passportData;
    return passportData ? getFeeBreakdown(passportData) : null;
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
    },
  );
}
