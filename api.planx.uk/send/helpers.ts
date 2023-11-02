import { gql } from "graphql-request";
import airbrake from "../airbrake";
import { $api } from '../client';

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
  };
}): Promise<void> {
  if (!flowId || !sessionId) {
    reportError({
      message:
        "Could not log the payment status due to missing context value(s)",
      context: { sessionId, flowId, teamSlug },
    });
  } else {
    // log payment status response
    try {
      await insertPaymentStatus({
        sessionId,
        flowId,
        teamSlug,
        paymentId: govUkResponse.payment_id,
        status: govUkResponse.state?.status || "unknown",
        amount: govUkResponse.amount,
      });
    } catch (e) {
      reportError({
        message: "Failed to insert a payment status",
        error: e,
        govUkResponse,
      });
    }
  }
}

// tmp explicit error handling
function reportError(obj: object) {
  if (airbrake) {
    airbrake.notify(obj);
    return;
  }
  log(obj);
}

// tmp logger
function log(event: object | string) {
  if (!process.env.SUPPRESS_LOGS) {
    console.log(event);
  }
}

// TODO: this would ideally live in planx-client
async function insertPaymentStatus({
  flowId,
  sessionId,
  paymentId,
  teamSlug,
  status,
  amount,
}: {
  flowId: string;
  sessionId: string;
  paymentId: string;
  teamSlug: string;
  status: string;
  amount: number;
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
      ) {
        insert_payment_status(
          objects: {
            flow_id: $flowId
            session_id: $sessionId
            payment_id: $paymentId
            team_slug: $teamSlug
            status: $status
            amount: $amount
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
    },
  );
}
