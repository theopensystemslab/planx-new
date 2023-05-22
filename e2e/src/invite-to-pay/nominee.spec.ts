import { test, expect, Page, APIRequestContext } from "@playwright/test";
import { v4 as uuidV4 } from "uuid";
import { setFeatureFlag, fillGovUkCardDetails, cards } from "../helpers";
import inviteToPayFlow from "../flows/invite-to-pay-flow";
import {
  Context,
  getGraphQLClient,
  setUpTestContext,
  tearDownTestContext,
} from "../context";
import { mockPaymentRequest, mockSessionData } from "./mocks";
import { GraphQLClient, gql } from "graphql-request";
import { Session } from "@opensystemslab/planx-core/types";
import { getPaymentRequestBySessionId } from "./helpers";

let context: Context = {
  user: {
    firstName: "test",
    lastName: "test",
    email: "e2epaytest@opensystemslab.com",
  },
  team: {
    name: "Buckinghamshire",
    slug: "buckinghamshire",
    logo: "https://placedog.net/250/250",
    primaryColor: "#F30415",
    homepage: "example.com",
  },
  flow: {
    slug: "invite-to-pay-test",
    data: inviteToPayFlow,
  },
  sessionIds: [], // used to collect and clean up sessions
  paymentRequest: mockPaymentRequest
};

const paymentRequestDetails = {
  applicantName: "Mr Nominee",
  payeeName: "Mrs Agent" ,
  payeeEmail: "testAgent@opensystemslab.io",
  sessionPreviewKeys: [["_address", "title"], ["proposal.projectType"]],
}

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

  test.beforeEach(async ({ page }) => await setFeatureFlag(page, "INVITE_TO_PAY"));

  test.afterAll(async () => {
    await tearDownTestContext(context);
  });

  test("responding to a valid payment request", async ({ page, request }) => {
    const { paymentRequest, sessionId } = await setupPaymentRequest(page, request);
    await navigateToPaymentRequestPage(paymentRequest, page);

    expect(await page.getByRole("heading", { name: "Pay for your application" })).toBeVisible();
    expect(await page.locator("#main-content").getByText("Invite to pay test")).toBeVisible();
    expect(await page.getByText("123, Test Street, Testville")).toBeVisible();

    const formattedProjectType = "Alteration of internal walls and addition or alteration of a deck";
    expect(await page.getByText(formattedProjectType)).toBeVisible();

    const payButton = await page.getByRole("button", { name: "Pay using GOV.UK Pay" })
    expect(payButton).toBeVisible();

    await payButton.click();
    await fillGovUkCardDetails({
      page,
      cardNumber: cards.successful_card_number,
    });
    await page.getByRole("button", { name: "Confirm payment" }).click();
    await page.waitForURL("**/invite-to-pay-test/**");

    // Wait for GovPay re-request to update paymentRequest status
    await page.waitForLoadState("networkidle");

    expect(await page.getByText("Payment received")).toBeVisible();
    const updatedPaymentRequest = await getPaymentRequestBySessionId({ sessionId, adminGQLClient });
    expect(updatedPaymentRequest?.paidAt).toBeDefined();
  });

  // test.todo("responding to an expired payment request");
  // test.todo("responding to a paid payment request");
  // test.todo("responding to an invalid url");
});

async function navigateToPaymentRequestPage(paymentRequest, page: Page) {
  const paymentRequestURL = `/${context.team!.slug!}/${context.flow!
    .slug!}/pay?analytics=false&paymentRequestId=${paymentRequest.id}`;
  await page.goto(paymentRequestURL);
}

async function setupPaymentRequest(page: Page, request: APIRequestContext): Promise<Record<"paymentRequest", PaymentRequest> & Record<"sessionId", string>> {
  const sessionId = uuidV4();
  context.sessionIds?.push(sessionId);
  await createSession({ client: adminGQLClient, context, sessionId });
  const paymentRequest = await createPaymentRequest(request, sessionId)
  return { paymentRequest, sessionId };
}

async function createSession({ context, client, sessionId }: { context: Context, client: GraphQLClient, sessionId: string }) {
  const mutation = gql`
    mutation CreateSession(
      $data: jsonb!
      $id: uuid!
      $email: String
      $flowId: uuid!
    ) {
      session: insert_lowcal_sessions_one(
        object: { data: $data, id: $id, email: $email, flow_id: $flowId }
        on_conflict: {
          constraint: lowcal_sessions_pkey
          update_columns: data
          }
        ) {
        id
      }
    }
  `
  await client.request<Record<"session", Pick<Session, "id">[]>>(mutation, { 
    id: sessionId,
    data: { 
      id: context.flow?.id,
      ...mockSessionData
    },
    email: context.user.email,
    flowId: context.flow?.id,
  });
}

/** 
 * Create PaymentRequest via API
 * This method ensures that session is locked
 */
async function createPaymentRequest(request: APIRequestContext, sessionId: string) {
  const response = await request.post(`http://localhost:${process.env.API_PORT}/invite-to-pay/${sessionId}`, {
    data: paymentRequestDetails
  })
  return response.json();
}