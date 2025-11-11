import { PaymentRequest } from "@opensystemslab/planx-core/types";
import { expect, type Page } from "@playwright/test";
import { GraphQLClient, gql } from "graphql-request";
import {
  TEST_EMAIL,
  addSessionToContext,
  log,
} from "../helpers/globalHelpers.js";
import {
  answerChecklist,
  answerContactInput,
  fillInEmail,
} from "../helpers/userActions.js";
import { TestContext } from "../helpers/types.js";
import { answerFindProperty } from "../helpers/geoSpatialUserActions.js";

/**
 * Navigates to pay component whilst completing the minimum requirements for an Invite to Pay flow
 */
export async function navigateToPayComponent(page: Page, context: TestContext) {
  const previewURL = `/${context.team!.slug!}/${
    context.flow?.slug
  }/published?analytics=false`;
  await page.goto(previewURL);

  await fillInEmail({ page, context });
  await page.getByText("Continue").click();

  await answerChecklist({
    page,
    title: "What is your project type?",
    answers: ["Addition or alteration of a deck", "Alter internal walls"],
  });
  await page.getByText("Continue").click();

  await answerFindProperty(page);
  await page.getByText("Continue").click();

  await answerContactInput(page, {
    firstName: "agentFirst",
    lastName: "agentLast",
    email: TEST_EMAIL,
    phoneNumber: "(0123) 456789",
  });
  await page.getByText("Continue").click();
}

export async function answerInviteToPayForm(page: Page) {
  await page.getByLabel("Full name").fill("Mr Nominee");
  await page.getByLabel("Email").fill(TEST_EMAIL);
  await page.getByLabel("Your name").fill("Mr Agent (Agency Ltd)");
}

export async function getPaymentRequestBySessionId({
  sessionId,
  adminGQLClient,
}: {
  sessionId: string;
  adminGQLClient: GraphQLClient;
}): Promise<PaymentRequest | undefined> {
  try {
    const { paymentRequests }: { paymentRequests: PaymentRequest[] } =
      await adminGQLClient.request(
        gql`
          query GetPaymentRequestBySessionId($sessionId: uuid!) {
            paymentRequests: payment_requests(
              where: { session_id: { _eq: $sessionId } }
            ) {
              id
              payeeEmail: payee_email
              payeeName: payee_name
              sessionPreviewData: session_preview_data
              paymentAmount: payment_amount
              applicantName: applicant_name
              paidAt: paid_at
              feeBreakdown: fee_breakdown
            }
          }
        `,
        { sessionId },
      );
    return paymentRequests[0];
  } catch (e) {
    log("Payment request not found: ", e);
  }
}

export async function makePaymentRequest({
  page,
  context,
}: {
  page: Page;
  context: TestContext;
}) {
  await navigateToPayComponent(page, context);
  const sessionId = await addSessionToContext(page, context);
  const toggleInviteToPayButton = page.getByRole("button", {
    name: "Invite someone else to pay",
  });
  await toggleInviteToPayButton.click();
  await answerInviteToPayForm(page);
  page.getByRole("button", { name: "Send invitation to pay" }).click();
  await page.waitForResponse((res) => res.url().includes("invite-to-pay"));
  await expect(page.getByText("Error generating payment")).toBeHidden();
  return sessionId;
}
