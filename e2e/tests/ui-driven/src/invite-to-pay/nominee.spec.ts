import { test, expect, Page, APIRequestContext } from "@playwright/test";
import { v4 as uuidV4 } from "uuid";
import { setFeatureFlag, fillGovUkCardDetails, cards } from "../helpers";
import inviteToPayFlow from "../flows/invite-to-pay-flow";
import {
  Context,
  contextDefaults,
  getGraphQLClient,
  setUpTestContext,
  tearDownTestContext,
} from "../context";
import { mockPaymentRequestDetails, mockSessionData } from "./mocks";
import { GraphQLClient, gql } from "graphql-request";
import { PaymentRequest, Session } from "@opensystemslab/planx-core/types";
import { getPaymentRequestBySessionId } from "./helpers";

let context: Context = {
  ...contextDefaults,
  flow: {
    slug: "invite-to-pay-test",
    data: inviteToPayFlow,
  },
  sessionIds: [], // used to collect and clean up sessions
};

const PAYMENT_NOT_FOUND_TEXT = "Sorry, we can’t find that payment link";

const adminGQLClient = getGraphQLClient();

test.describe("Nominee journey", async () => {
  test.beforeAll(async () => {
    try {
      context = await setUpTestContext(context);
    } catch (e) {
      // ensure proper teardown if setup fails
      await tearDownTestContext(context);
      throw e;
    }
  });

  test.afterAll(async () => {
    await tearDownTestContext(context);
  });

  test("responding to a valid payment request", async ({ page, request }) => {
    const { paymentRequest, sessionId } = await setupPaymentRequest(request);
    await navigateToPaymentRequestPage(paymentRequest, page);

    await expect(
      await page.getByRole("heading", { name: "Pay for your application" })
    ).toBeVisible();
    await expect(
      page.locator("#main-content").getByText("Invite to pay test")
    ).toBeVisible();
    await expect(page.getByText("123, Test Street, Testville")).toBeVisible();

    const formattedProjectType =
      "Alteration of internal walls and addition or alteration of a deck";
    await expect(page.getByText(formattedProjectType)).toBeVisible();

    const payButton = await page.getByRole("button", {
      name: "Pay using GOV.UK Pay",
    });
    await expect(payButton).toBeVisible();

    await payButton.click();
    await fillGovUkCardDetails({
      page,
      cardNumber: cards.successful_card_number,
    });
    await page.getByRole("button", { name: "Confirm payment" }).click();
    await page.waitForURL("**/invite-to-pay-test/**");

    // Wait for GovPay re-request to update paymentRequest status
    await page.waitForLoadState("networkidle");

    await expect(page.getByText("Payment received")).toBeVisible();
    const updatedPaymentRequest = await getPaymentRequestBySessionId({
      sessionId,
      adminGQLClient,
    });
    expect(updatedPaymentRequest?.paidAt).toBeDefined();
  });

  test("navigating to a URL with an invalid ID", async ({ page }) => {
    const invalidPaymentRequestURL = `/${context.team!.slug!}/${context.flow!
      .slug!}/pay?analytics=false&paymentRequestId=INVALID-ID`;
    await page.goto(invalidPaymentRequestURL);
    await page.waitForLoadState("networkidle");

    await expect(page.getByText(PAYMENT_NOT_FOUND_TEXT)).toBeVisible();
  });

  test("navigating to a URL without a paymentRequestId", async ({ page }) => {
    const invalidPaymentRequestURL = `/${context.team!.slug!}/${context.flow!
      .slug!}/pay?analytics=false`;
    await page.goto(invalidPaymentRequestURL);
    await page.waitForLoadState("networkidle");

    await expect(page.getByText(PAYMENT_NOT_FOUND_TEXT)).toBeVisible();
  });

  test("responding to a payment request which has been paid", async ({
    page,
    request,
  }) => {
    const { paymentRequest } = await setupPaymentRequest(request);
    await markPaymentRequestAsPaid(paymentRequest);
    await navigateToPaymentRequestPage(paymentRequest, page);

    await expect(page.getByText(PAYMENT_NOT_FOUND_TEXT)).toBeVisible();
  });

  test("responding to a payment request which has expired", async ({
    page,
    request,
  }) => {
    const { paymentRequest } = await setupPaymentRequest(request);
    await markPaymentRequestAsExpired(paymentRequest);
    await navigateToPaymentRequestPage(paymentRequest, page);

    await expect(page.getByText(PAYMENT_NOT_FOUND_TEXT)).toBeVisible();
  });
});

async function navigateToPaymentRequestPage(
  paymentRequest: PaymentRequest,
  page: Page
) {
  const paymentRequestURL = `/${context.team!.slug!}/${context.flow!
    .slug!}/pay?analytics=false&paymentRequestId=${paymentRequest.id}`;
  await page.goto(paymentRequestURL);
  await page.waitForLoadState("networkidle");
}

async function setupPaymentRequest(
  request: APIRequestContext
): Promise<
  Record<"paymentRequest", PaymentRequest> & Record<"sessionId", string>
> {
  const sessionId = uuidV4();
  context.sessionIds?.push(sessionId);
  await createSession({ client: adminGQLClient, context, sessionId });
  const paymentRequest = await createPaymentRequest(request, sessionId);
  return { paymentRequest, sessionId };
}

async function createSession({
  context,
  client,
  sessionId,
}: {
  context: Context;
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
  sessionId: string
) {
  const response = await request.post(
    `http://localhost:${process.env.API_PORT}/invite-to-pay/${sessionId}`,
    {
      data: mockPaymentRequestDetails,
    }
  );
  return response.json();
}

async function markPaymentRequestAsPaid(paymentRequest: PaymentRequest) {
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

async function markPaymentRequestAsExpired(paymentRequest: PaymentRequest) {
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
