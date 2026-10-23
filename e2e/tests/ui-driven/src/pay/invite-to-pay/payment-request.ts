import type { PaymentRequest, Session } from "@opensystemslab/planx-core/types";
import type { APIRequestContext, Page } from "@playwright/test";
import type { GraphQLClient } from "graphql-request";
import { gql } from "graphql-request";
import { v4 as uuidV4 } from "uuid";

import { getGraphQLClient } from "../../helpers/context.js";
import type { TestContext } from "../../helpers/types.js";
import { mockPaymentRequestDetails, mockSessionData } from "./mocks.js";

const adminGQLClient = getGraphQLClient();

export async function navigateToPaymentRequestPage(
  paymentRequest: PaymentRequest,
  page: Page,
  context: TestContext,
) {
  const paymentRequestURL = `/${context.team!.slug!}/${context.flow?.slug}/pay?analytics=false&paymentRequestId=${paymentRequest.id}`;
  await page.goto(paymentRequestURL);
  await page.waitForLoadState("networkidle");
}

export async function setupPaymentRequest(
  request: APIRequestContext,
  context: TestContext,
): Promise<
  Record<"paymentRequest", PaymentRequest> & Record<"sessionId", string>
> {
  const sessionId = uuidV4();
  context.sessionIds?.push(sessionId);
  await createSession({ client: adminGQLClient, context, sessionId });
  const paymentRequest = await createPaymentRequest(
    request,
    sessionId,
    context.user.email,
  );
  return { paymentRequest, sessionId };
}

async function createSession({
  context,
  client,
  sessionId,
}: {
  context: TestContext;
  client: GraphQLClient;
  sessionId: string;
}) {
  const mutation = gql`
    mutation CreateSession(
      $data: jsonb!
      $id: uuid!
      $email: String
      $flowId: uuid!
    ) {
      session: insert_lowcal_sessions_one(
        object: { data: $data, id: $id, email: $email, flow_id: $flowId }
        on_conflict: { constraint: lowcal_sessions_pkey, update_columns: data }
      ) {
        id
      }
    }
  `;
  await client.request<Record<"session", Pick<Session, "id">[]>>(mutation, {
    id: sessionId,
    data: {
      id: context.flow?.id,
      ...mockSessionData,
    },
    email: context.user.email,
    flowId: context.flow?.id,
  });
}

/**
 * Create PaymentRequest via API
 * This method ensures that the session is locked
 */
async function createPaymentRequest(
  request: APIRequestContext,
  sessionId: string,
  email: string,
) {
  const response = await request.post(
    `http://localhost:${process.env.API_PORT}/invite-to-pay/${sessionId}`,
    {
      data: { ...mockPaymentRequestDetails, email },
    },
  );
  return response.json();
}

export async function markPaymentRequestAsPaid(paymentRequest: PaymentRequest) {
  const mutation = gql`
    mutation MarkPaymentRequestAsPaid($id: uuid!) {
      update_payment_requests_by_pk(
        pk_columns: { id: $id }
        _set: { paid_at: "now()" }
      ) {
        id
      }
    }
  `;
  await adminGQLClient.request(mutation, {
    id: paymentRequest.id,
  });
}

export async function markPaymentRequestAsExpired(
  paymentRequest: PaymentRequest,
) {
  const mutation = gql`
    mutation MarkPaymentRequestAsPaid($id: uuid!) {
      update_payment_requests_by_pk(
        pk_columns: { id: $id }
        _set: { created_at: "2020-02-02" }
      ) {
        id
      }
    }
  `;
  await adminGQLClient.request(mutation, {
    id: paymentRequest.id,
  });
}
