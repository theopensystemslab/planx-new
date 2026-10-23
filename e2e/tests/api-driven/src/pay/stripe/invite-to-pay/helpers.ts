import assert from "node:assert";

import type { FlowGraph } from "@opensystemslab/planx-core/types";
import { ComponentType } from "@opensystemslab/planx-core/types";
import axios, { isAxiosError } from "axios";
import { gql } from "graphql-tag";

import { poll } from "../../../../../shared/poll.js";
import { getCheckoutSessionId } from "../../../../../shared/stripe/completeCheckoutSession.js";
import { $admin, targetURL } from "../../../client.js";
import { TEST_EMAIL } from "../../../globalHelpers.js";
import {
  buildITPFlow,
  setup as setupSubmittingTeam,
} from "../../invite-to-pay/helpers.js";
import {
  mockBreadcrumbs,
  mockPassport,
} from "../../invite-to-pay/mocks/index.js";
import {
  connectStripeAccount,
  createSessionWithFees,
  type FeeCase,
} from "../helpers.js";

/**
 * Invite to pay requires a Pay node, and submits to each of the Send node's destinations once paid
 *
 * No submission email is configured for the team, so the scheduled "email" submission fails
 * harmlessly - these tests only count that it was scheduled
 */
const inviteToPayFlowGraph: FlowGraph = {
  _root: { edges: ["Pay", "Send"] },
  Pay: {
    type: ComponentType.Pay,
    data: { title: "Pay for your application", allowInviteToPay: true },
  },
  Send: {
    type: ComponentType.Send,
    data: { title: "Send", destinations: ["email"] },
  },
};

export async function buildInviteToPaySession({
  teamId,
  userId,
  feeCase,
}: {
  teamId: number;
  userId: number;
  feeCase: FeeCase;
}) {
  const flowId = await $admin.flow.create({
    teamId,
    userId,
    slug: "stripe-invite-to-pay-test",
    name: "Stripe invite to pay test",
    data: inviteToPayFlowGraph,
    status: "online",
    hasSendComponent: true,
  });
  const sessionId = await createSessionWithFees({ flowId, feeCase });
  return { flowId, sessionId };
}

/**
 * A Stripe team whose invite to pay flow submits to a real destination, via the mock server
 * Reuses the GOV.UK Pay submissions setup - submission after `paid_at` is provider-neutral
 */
export async function buildSubmittingInviteToPaySession(destination: string) {
  const { teamId, userId } = await setupSubmittingTeam();
  await connectStripeAccount(teamId);
  const { flowId } = await buildITPFlow({ destination, teamId, userId });
  const sessionId = await $admin.session.create({
    flowId,
    data: { breadcrumbs: mockBreadcrumbs, passport: mockPassport },
    email: TEST_EMAIL,
  });
  return { teamId, userId, flowId, sessionId };
}

export async function inviteNominee(sessionId: string): Promise<string> {
  const { data } = await axios.post<{ id: string }>(
    `${process.env.API_URL_EXT}/invite-to-pay/${sessionId}`,
    {
      email: TEST_EMAIL,
      payeeEmail: TEST_EMAIL,
      payeeName: "Nominee",
      applicantName: "Agent",
      sessionPreviewKeys: [["_address", "title"], ["proposal.projectType"]],
    },
  );
  return data.id;
}

export async function createPaymentRequestCheckoutSession(
  paymentRequestId: string,
): Promise<string> {
  const { data } = await axios.post<{ url: string }>(
    `${process.env.API_URL_EXT}/stripe/payment-request/${paymentRequestId}/checkout-session`,
  );
  return getCheckoutSessionId(data.url);
}

export interface FulfilResponse {
  status: number;
  data: unknown;
}

/**
 * Called by the payer page when Stripe redirects the nominee back to PlanX
 */
export async function fulfilPaymentRequest({
  paymentRequestId,
  checkoutSessionId,
}: {
  paymentRequestId: string;
  checkoutSessionId: string;
}): Promise<FulfilResponse> {
  const { status, data } = await axios.post(
    `${process.env.API_URL_EXT}/stripe/payment-request/${paymentRequestId}/fulfil`,
    { checkoutSessionId },
    { validateStatus: () => true },
  );
  return { status, data };
}

export interface Refusal {
  status: number;
  message: string;
}

export function toRefusal({ status, data }: FulfilResponse): Refusal {
  const message = (data as { error?: string } | undefined)?.error ?? "";
  return { status, message };
}

/**
 * Make a request we expect the API to refuse, and return why it was refused
 */
export async function getRefusal(
  request: () => Promise<unknown>,
): Promise<Refusal> {
  try {
    await request();
  } catch (error) {
    if (isAxiosError(error) && error.response) return toRefusal(error.response);
    throw error;
  }
  assert.fail("Expected the request to be refused, but it succeeded");
}

export interface PaymentRequestPaymentState {
  paidAt: string | null;
  stripePaymentId: string | null;
}

export async function getPaymentRequestPaymentState(
  paymentRequestId: string,
): Promise<PaymentRequestPaymentState> {
  const { paymentRequest } = await $admin.client.request<{
    paymentRequest: PaymentRequestPaymentState | null;
  }>(
    gql`
      query GetStripePaymentRequestPaymentState($paymentRequestId: uuid!) {
        paymentRequest: payment_requests_by_pk(id: $paymentRequestId) {
          paidAt: paid_at
          stripePaymentId: stripe_payment_id
        }
      }
    `,
    { paymentRequestId },
  );
  assert(paymentRequest, `Payment request ${paymentRequestId} not found`);
  return paymentRequest;
}

export async function waitForPaymentRequestToBePaid(
  paymentRequestId: string,
): Promise<PaymentRequestPaymentState> {
  return poll({
    fetch: () => getPaymentRequestPaymentState(paymentRequestId),
    until: ({ paidAt }) => Boolean(paidAt),
    describeTimeout: () =>
      `Payment request ${paymentRequestId} was not marked as paid`,
  });
}

export async function getSessionPassportData(
  sessionId: string,
): Promise<Record<string, unknown>> {
  const { session } = await $admin.client.request<{
    session: { passportData: Record<string, unknown> } | null;
  }>(
    gql`
      query GetStripeInviteToPaySessionPassport($sessionId: uuid!) {
        session: lowcal_sessions_by_pk(id: $sessionId) {
          passportData: data(path: "passport.data")
        }
      }
    `,
    { sessionId },
  );
  assert(session, `Session ${sessionId} not found`);
  return session.passportData;
}

/**
 * Docs: https://hasura.io/docs/2.0/api-reference/schema-api/run-sql/
 */
interface RunSqlResponse {
  result: [columnNames: string[], ...rows: string[][]];
}

/**
 * Count the Hasura scheduled events which submit this session to the team's email
 *
 * Paying an invite sets `paid_at`, and the `setup_payment_send_events` trigger then schedules one
 * event per send destination. Scheduled events aren't exposed via GraphQL, so we read them directly
 *
 * The send handlers skip sessions which have already been submitted, so counting submissions in the
 * audit tables couldn't catch a duplicate - the scheduled event is the most accurate thing to count
 */
async function countScheduledEmailSubmissions(
  sessionId: string,
): Promise<number> {
  const { data } = await axios.post<RunSqlResponse>(
    targetURL.replace("/v1/graphql", "/v2/query"),
    {
      type: "run_sql",
      args: {
        sql: `SELECT count(*) FROM hdb_catalog.hdb_scheduled_events WHERE comment = 'email_submission_${sessionId}'`,
        read_only: true,
      },
    },
    {
      headers: {
        "x-hasura-admin-secret": process.env.HASURA_GRAPHQL_ADMIN_SECRET!,
      },
    },
  );
  const [_columnNames, [count]] = data.result;
  return Number(count);
}

export async function waitForScheduledEmailSubmissions(
  sessionId: string,
): Promise<number> {
  return poll({
    fetch: () => countScheduledEmailSubmissions(sessionId),
    until: (count) => count > 0,
    describeTimeout: () =>
      `No email submission was scheduled for session ${sessionId}`,
  });
}

/**
 * Invites expire 28 days after they're sent
 */
export async function expirePaymentRequest(paymentRequestId: string) {
  await updatePaymentRequest(paymentRequestId, { created_at: "2020-02-02" });
}

/**
 * A request which has started a GOV.UK Pay payment stays on GOV.UK Pay until it's paid or expires
 */
export async function startGovPayPayment(paymentRequestId: string) {
  await updatePaymentRequest(paymentRequestId, {
    govpay_payment_id: "e2e-govpay-payment-id",
  });
}

async function updatePaymentRequest(
  paymentRequestId: string,
  changes: Record<string, string>,
) {
  await $admin.client.request(
    gql`
      mutation UpdateStripeE2EPaymentRequest(
        $paymentRequestId: uuid!
        $changes: payment_requests_set_input!
      ) {
        update_payment_requests_by_pk(
          pk_columns: { id: $paymentRequestId }
          _set: $changes
        ) {
          id
        }
      }
    `,
    { paymentRequestId, changes },
  );
}
