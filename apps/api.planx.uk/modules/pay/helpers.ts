import { getFeeBreakdown } from "@opensystemslab/planx-core";
import type {
  FeeBreakdown,
  GovPayMetadataValue,
  Session,
} from "@opensystemslab/planx-core/types";
import { gql } from "graphql-request";

import airbrake from "../../airbrake.js";
import { $api } from "../../client/index.js";

/**
 * Gracefully handle GovPay errors
 * Docs: https://docs.payments.service.gov.uk/api_reference/#responses
 */
export const handleGovPayErrors = (res: unknown) =>
  JSON.stringify({
    message:
      "GovPay responded with an error when attempting to proxy to their API",
    govPayResponse: res,
  });

export async function logPaymentStatus({
  sessionId,
  flowId,
  teamSlug,
  govUkResponse,
}: {
  sessionId: string | undefined;
  flowId: string | undefined;
  teamSlug: string;
  govUkResponse: {
    amount: number;
    payment_id: string;
    state: {
      status: string;
    };
    metadata?: Record<string, GovPayMetadataValue>;
  };
}): Promise<void> {
  if (!flowId || !sessionId) {
    reportError({
      error: "Could not log the payment status due to missing context value(s)",
      context: { sessionId, flowId, teamSlug },
    });
  } else {
    try {
      // get fee breakdown for this session
      const passportData = await getPassportData(sessionId);
      if (!passportData) {
        reportError({
          error:
            "Could not log the payment status due to missing passport data",
          context: { sessionId, flowId, teamSlug },
        });
      }

      const feeBreakdown = getFeeBreakdown(passportData);

      // log payment status response
      await insertPaymentStatus({
        sessionId,
        flowId,
        teamSlug,
        paymentId: govUkResponse.payment_id,
        status: govUkResponse.state?.status || "unknown",
        amount: govUkResponse.amount,
        feeBreakdown,
        metadata: govUkResponse.metadata,
      });
    } catch (e) {
      reportError({
        error: `Failed to insert a payment status: ${e}`,
        context: { govUkResponse },
      });
    }
  }
}

interface GetPassportData {
  session: Partial<{ passportData: Session["data"]["passport"]["data"] }>;
}

async function getPassportData(sessionId: string) {
  const response = await $api.client.request<GetPassportData>(
    gql`
      query GetSessionData($id: uuid!) {
        session: lowcal_sessions_by_pk(id: $id) {
          passportData: data(path: "passport.data")
        }
      }
    `,
    {
      id: sessionId,
    },
  );

  return response?.session?.passportData;
}

async function insertPaymentStatus({
  flowId,
  sessionId,
  paymentId,
  teamSlug,
  status,
  amount,
  feeBreakdown,
  metadata,
}: {
  flowId: string;
  sessionId: string;
  paymentId: string;
  teamSlug: string;
  status: string;
  amount: number;
  feeBreakdown: FeeBreakdown;
  metadata?: Record<string, GovPayMetadataValue>;
}): Promise<void> {
  const _response = await $api.client.request(
    gql`
      mutation InsertPaymentStatus(
        $flowId: uuid!
        $sessionId: uuid!
        $paymentId: String!
        $teamSlug: String!
        $status: payment_status_enum_enum
        $amount: Int!
        $feeBreakdown: jsonb!
        $metadata: jsonb
      ) {
        insert_payment_status(
          objects: {
            flow_id: $flowId
            session_id: $sessionId
            payment_id: $paymentId
            team_slug: $teamSlug
            status: $status
            amount: $amount
            fee_breakdown: $feeBreakdown
            gov_pay_metadata: $metadata
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
      paymentId,
      status,
      amount,
      feeBreakdown,
      metadata,
    },
  );
}

// tmp explicit error handling
export function reportError(report: { error: any; context: object }) {
  if (airbrake) {
    airbrake.notify(report);
    return;
  }
  log(report);
}

// tmp logger
function log(event: object | string) {
  if (!process.env.SUPPRESS_LOGS) {
    console.log(event);
  }
}
