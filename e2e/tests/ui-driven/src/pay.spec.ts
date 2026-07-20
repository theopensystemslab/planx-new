import type { SessionData } from "@opensystemslab/planx-core/types";
import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";
import type { GraphQLClient } from "graphql-request";
import { gql } from "graphql-request";

import {
  contextDefaults,
  getGraphQLClient,
  setUpTestContext,
  tearDownTestContext,
} from "./helpers/context.js";
import {
  cards,
  getSessionId,
  log,
  waitForPaymentResponse,
} from "./helpers/globalHelpers.js";
import type { TestContext } from "./helpers/types.js";
import {
  fillGovUkCardDetails,
  fillInEmail,
  submitCardDetails,
} from "./helpers/userActions.js";
import payFlow from "./mocks/flows/pay-flow.json" with { type: "json" };

let context: TestContext = {
  ...contextDefaults,
  flow: {
    slug: "pay-test",
    name: "Pay test",
    data: payFlow,
    hasSendComponent: true,
  },

  sessionIds: [], // used to collect and clean up sessions
};
const previewURL = `/${context.team!.slug!}/${context.flow?.slug}/published?analytics=false`;

const payButtonText = "Pay now using GOV.UK Pay";

test.describe("Gov Pay integration @regression", () => {
  const adminGQLClient = getGraphQLClient();

  test.beforeAll(async () => {
    try {
      context = await setUpTestContext(context);
    } catch (e) {
      // ensure proper teardown if setup fails
      await tearDownTestContext();
      throw e;
    }
  });

  test.afterAll(async () => {
    await tearDownTestContext();
  });

  test("a successful payment", async ({ page }) => {
    await setGovPayReferrer(page);

    const sessionId = await navigateToPayComponent(page, context);
    context.sessionIds!.push(sessionId);

    await page.getByText(payButtonText).click();
    await fillGovUkCardDetails({
      page,
      cardNumber: cards.successful_card_number,
    });
    await submitCardDetails(page);
    const { paymentId } = await waitForPaymentResponse(page, context);
    expect(paymentId).toBeTruthy();

    // ensure a audit log entry was created
    expect(
      await hasPaymentStatus({
        status: "success",
        paymentId: paymentId,
        adminGQLClient,
      }),
    ).toBe(true);

    // ensure that data stored in the session matches the latest payment attempt
    const session = await findSession({
      adminGQLClient,
      sessionId,
    });
    expect(session?.data?.govUkPayment?.payment_id).toEqual(paymentId);

    await expect(page.getByText("Form sent")).toBeVisible();
    await expect(page.getByText(paymentId!)).toBeVisible();
  });

  test("a retry attempt for a failed GOV.UK payment", async ({ page }) => {
    await setGovPayReferrer(page);

    const sessionId = await navigateToPayComponent(page, context);
    context.sessionIds!.push(sessionId);

    await page.getByText(payButtonText).click();
    await fillGovUkCardDetails({ page, cardNumber: cards.invalid_card_number });
    await page.locator("#return-url").click();

    const { paymentId: failedPaymentRef } = await waitForPaymentResponse(
      page,
      context,
    );
    expect(failedPaymentRef).toBeTruthy();

    // ensure a audit log entry was created
    expect(
      await hasPaymentStatus({
        status: "failed",
        paymentId: failedPaymentRef,
        adminGQLClient,
      }),
    ).toBe(true);

    // ensure that data stored in the session matches the latest payment attempt
    let session = await findSession({
      adminGQLClient,
      sessionId,
    });
    expect(session?.data?.govUkPayment?.payment_id).toEqual(failedPaymentRef);

    await page.getByText("Retry payment").click();
    await fillGovUkCardDetails({
      page,
      cardNumber: cards.successful_card_number,
    });
    await submitCardDetails(page);
    const { paymentId } = await waitForPaymentResponse(page, context);
    expect(paymentId).toBeTruthy();

    // ensure a audit log entry was created
    expect(
      await hasPaymentStatus({
        status: "success",
        paymentId: paymentId,
        adminGQLClient,
      }),
    ).toBe(true);

    // ensure that data stored in the session matches the latest payment attempt
    session = await findSession({
      adminGQLClient,
      sessionId,
    });
    expect(session?.data?.govUkPayment?.payment_id).toEqual(paymentId);

    await expect(page.getByText("Form sent")).toBeVisible();
    await expect(page.getByText(paymentId)).toBeVisible();
  });

  test("a retry attempt for a cancelled GOV.UK payment", async ({ page }) => {
    await setGovPayReferrer(page);

    const sessionId = await navigateToPayComponent(page, context);
    context.sessionIds!.push(sessionId);

    await page.getByText(payButtonText).click();
    await page.locator("#cancel-payment").click();
    await page.locator("#return-url").click();
    const { paymentId: failedPaymentRef } = await waitForPaymentResponse(
      page,
      context,
    );
    expect(failedPaymentRef).toBeTruthy();

    // ensure a audit log entry was created
    expect(
      await hasPaymentStatus({
        status: "failed", // note: GovPay returns "failed" rather than "cancelled"
        paymentId: failedPaymentRef,
        adminGQLClient,
      }),
    ).toBe(true);

    await page.getByText("Retry payment").click();
    await fillGovUkCardDetails({
      page,
      cardNumber: cards.successful_card_number,
    });
    await submitCardDetails(page);
    const { paymentId } = await waitForPaymentResponse(page, context);
    expect(paymentId).toBeTruthy();

    // ensure a audit log entry was created
    expect(
      await hasPaymentStatus({
        status: "success",
        paymentId: paymentId,
        adminGQLClient,
      }),
    ).toBe(true);

    // ensure that data stored in the session matches the latest payment attempt
    const session = await findSession({
      adminGQLClient,
      sessionId,
    });
    expect(session?.data?.govUkPayment?.payment_id).toEqual(paymentId);

    await expect(page.getByText("Form sent")).toBeVisible();
    await expect(page.getByText(paymentId!)).toBeVisible();
  });

  test("a retry attempt for an abandoned GOV.UK payment", async ({ page }) => {
    const sessionId = await navigateToPayComponent(page, context);
    context.sessionIds!.push(sessionId);

    await page.getByText(payButtonText).click();
    await fillGovUkCardDetails({
      page,
      cardNumber: cards.successful_card_number,
    });

    // Abandon the payment and navigate back to PlanX
    await page.goto(previewURL);

    // ensure that data stored in the session matches the latest payment attempt
    const initialSession = await findSession({
      adminGQLClient,
      sessionId,
    });
    expect(initialSession?.data?.govUkPayment?.state?.status).toEqual(
      "created",
    );
    // ensure a audit log entry was created
    expect(
      await hasPaymentStatus({
        status: "created",
        paymentId: initialSession!.data!.govUkPayment!.payment_id,
        adminGQLClient,
      }),
    ).toBe(true);

    // resume the session via a magic link
    await resumeSessionViaMagicLink({ page, context, sessionId });

    await page.getByText("Retry payment").click();
    await page.getByText("Continue with your payment").click();

    await setGovPayReferrer(page);

    await submitCardDetails(page);

    const { paymentId } = await waitForPaymentResponse(page, context);
    expect(paymentId).toBeTruthy();

    // ensure a audit log entry was created
    expect(
      await hasPaymentStatus({
        status: "success",
        paymentId,
        adminGQLClient,
      }),
    ).toBe(true);

    // ensure that data stored in the session matches the latest payment attempt
    const updatedSession = await findSession({
      adminGQLClient,
      sessionId,
    });
    expect(updatedSession?.data?.govUkPayment?.payment_id).toEqual(paymentId);

    await expect(page.getByText("Form sent")).toBeVisible();
    await expect(page.getByText(paymentId!)).toBeVisible();
  });

  test("a retry attempt for an abandoned and then cancelled GOV.UK payment", async ({
    page,
  }) => {
    const sessionId = await navigateToPayComponent(page, context);
    context.sessionIds!.push(sessionId);

    // begin a payment
    await page.getByText(payButtonText).click();
    await fillGovUkCardDetails({
      page,
      cardNumber: cards.successful_card_number,
    });

    // abandon the payment and return to PlanX via a magic link
    await resumeSessionViaMagicLink({ page, context, sessionId });

    // resume the payment and cancel it
    await page.getByText("Retry payment").click();

    await setGovPayReferrer(page);

    await page.getByText("Cancel and go back to try the payment again").click();

    // retry and complete the payment
    await page.getByText("Retry payment").click();
    await fillGovUkCardDetails({
      page,
      cardNumber: cards.successful_card_number,
    });

    await submitCardDetails(page);

    const { paymentId: actualPaymentId } = await waitForPaymentResponse(
      page,
      context,
    );

    // ensure that data stored in the session matches the latest payment attempt
    const session = await findSession({
      adminGQLClient,
      sessionId,
    });
    expect(session?.data?.govUkPayment?.payment_id).toEqual(actualPaymentId);

    // ensure the user moves to the next page
    await expect(page.getByText("Form sent")).toBeVisible();
  });

  test("navigating back to the pay component after a successful payment", async ({
    page,
  }) => {
    const sessionId = await navigateToPayComponent(page, context);
    context.sessionIds!.push(sessionId);

    await page.getByText(payButtonText).click();
    await fillGovUkCardDetails({
      page,
      cardNumber: cards.successful_card_number,
    });

    await setGovPayReferrer(page);

    await submitCardDetails(page);
    const { paymentId: actualPaymentId } = await waitForPaymentResponse(
      page,
      context,
    );
    await expect(page.getByText("Form sent")).toBeVisible();
    await expect(page.getByText(actualPaymentId)).toBeVisible();

    // Try going back to the GovPay payment page
    await page.goBack();
    // Unable to make another payment - just get a status page...
    await expect(
      page.locator("h1").getByText("Your payment was successful"),
    ).toBeVisible();
    // ...with a link back to PlanX
    await page.locator("a").getByText("View your payment summary").click();
    await expect(page.getByText("Form sent")).toBeVisible();
  });

  // A user who abandons a payment by hitting "back" in their browser should
  // return to their session ("Confirm your email") not start a new one ("Enter your email" x2)
  test("navigating back from GOV.UK Pay via the browser during an in-flight payment", async ({
    page,
  }) => {
    const sessionId = await navigateToPayComponent(page, context);
    context.sessionIds!.push(sessionId);

    await startPaymentAndWaitForGovPay(page);

    // Navigate "back" via browser
    await page.goBack();

    await expectSessionResumedAtRetryPayment({
      page,
      context,
      sessionId,
      adminGQLClient,
    });
  });

  // As above, but navigating directly to the resume URL rather than using "back"
  test("navigating to the resume URL during an in-flight payment", async ({
    page,
  }) => {
    const sessionId = await navigateToPayComponent(page, context);
    context.sessionIds!.push(sessionId);

    await startPaymentAndWaitForGovPay(page);

    // Abandon the payment by navigating directly back to PlanX
    await page.goto(`${previewURL}&sessionId=${sessionId}`);

    await expectSessionResumedAtRetryPayment({
      page,
      context,
      sessionId,
      adminGQLClient,
    });
  });
});

async function navigateToPayComponent(
  page: Page,
  context: TestContext,
): Promise<string> {
  await page.goto(previewURL);
  await fillInEmail({ page, context });
  await page.getByTestId("continue-button").click();
  await page.getByLabel("Pay test").fill("Test");
  await page.getByTestId("continue-button").click();
  return getSessionId(page);
}

async function startPaymentAndWaitForGovPay(page: Page) {
  await page.getByText(payButtonText).click();
  await expect(page.locator("#card-no")).toBeVisible();
}

/**
 * A user who returns to PlanX mid-payment lands on the resume page for their
 * session. After confirming their email they're returned to the Pay component,
 * on their original session, with the option to pick the payment back up.
 */
async function expectSessionResumedAtRetryPayment({
  page,
  context,
  sessionId,
  adminGQLClient,
}: {
  page: Page;
  context: TestContext;
  sessionId: string;
  adminGQLClient: GraphQLClient;
}) {
  // The original payment is still attached to the session
  const abandonedSession = await findSession({ adminGQLClient, sessionId });
  const originalPaymentId = abandonedSession?.data?.govUkPayment?.payment_id;
  expect(originalPaymentId).toBeTruthy();

  // The user is prompted to re-enter their email to resume...
  await page.locator("#email").fill(context.user.email);
  const validateResponse = page.waitForResponse((response) =>
    response.url().includes("/validate-session"),
  );
  await page.getByTestId("continue-button").click();
  await validateResponse;

  // ...and are returned to the Pay component to retry
  await expect(page.getByText("Retry payment")).toBeVisible();

  // The retry resumes the same payment rather than starting a second one
  const resumedSession = await findSession({ adminGQLClient, sessionId });
  expect(resumedSession?.data?.govUkPayment?.payment_id).toEqual(
    originalPaymentId,
  );
  expect(resumedSession?.data?.govUkPayment?.state?.status).toEqual("started");
}

async function hasPaymentStatus({
  status,
  paymentId,
  adminGQLClient,
}: {
  status: string;
  paymentId: string;
  adminGQLClient: GraphQLClient;
}): Promise<boolean> {
  try {
    const response: { payment_status: { status: string }[] } =
      await adminGQLClient.request(
        gql`
          query GetPaymentStatus(
            $paymentId: String!
            $status: payment_status_enum_enum!
          ) {
            payment_status(
              where: {
                payment_id: { _eq: $paymentId }
                status: { _eq: $status }
              }
            ) {
              status
            }
          }
        `,
        { paymentId, status },
      );
    if (
      response.payment_status.length === 1 &&
      response.payment_status[0].status
    ) {
      return response.payment_status[0].status === status;
    } else {
      return false;
    }
  } catch (e) {
    log(`Payment status not found:`, e);
  }
  return false;
}

async function findSession({
  sessionId,
  adminGQLClient,
}: {
  sessionId: string;
  adminGQLClient: GraphQLClient;
}): Promise<{ data: SessionData } | undefined> {
  const response: { lowcal_sessions: { data: SessionData } } =
    await adminGQLClient.request(
      gql`
        query FindLowcalSession($sessionId: uuid!) {
          lowcal_sessions(where: { id: { _eq: $sessionId } }, limit: 1) {
            data
          }
        }
      `,
      { sessionId },
    );
  return response.lowcal_sessions[0];
}

async function resumeSessionViaMagicLink({
  page,
  context,
  sessionId,
}: {
  page: Page;
  context: TestContext;
  sessionId: string;
}) {
  await page.goto(`${previewURL}&sessionId=${sessionId}`);
  await page.locator("#email").fill(context.user.email);
  await page.getByTestId("continue-button").click();
}

/**
 * Mock the document.referrer property within this test context
 *
 * referrer is not set when running in localhost, but our frontend
 * depends on this header to skip the reconciliation page for started payments
 *
 * Router interception is not a reliable alternative here - it's likely that
 * GovPay are stripping some headers on redirect
 *
 * Ref: apps/editor.planx.uk/src/pages/Preview/ResumePage.tsx
 */
async function setGovPayReferrer(page: Page) {
  await page.addInitScript(() => {
    Object.defineProperty(document, "referrer", {
      get: () => "https://card.payments.service.gov.uk/",
    });
  });
}
