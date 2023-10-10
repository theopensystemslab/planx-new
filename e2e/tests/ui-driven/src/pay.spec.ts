import { test, expect } from "@playwright/test";
import {
  cards,
  fillGovUkCardDetails,
  getSessionId,
  log,
  waitForPaymentResponse,
} from "./helpers";
import type { Page } from "@playwright/test";
import payFlow from "./mocks/flows/pay-flow.json";
import { gql, GraphQLClient } from "graphql-request";
import type { SessionData } from "@opensystemslab/planx-core/types";
import type { Context } from "./context";
import {
  contextDefaults,
  getGraphQLClient,
  setUpTestContext,
  tearDownTestContext,
} from "./context";

let context: Context = {
  ...contextDefaults,
  flow: {
    slug: "pay-test",
    data: payFlow,
  },
  sessionIds: [], // used to collect and clean up sessions
};
const previewURL = `/${context.team!.slug!}/${context.flow!
  .slug!}/preview?analytics=false`;

const payButtonText = "Pay now using GOV.UK Pay";

test.describe("Gov Pay integration @regression", async () => {
  const adminGQLClient = getGraphQLClient();

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

  test("a successful payment", async ({ page }) => {
    const sessionId = await navigateToPayComponent(page);
    context.sessionIds!.push(sessionId);

    await page.getByText(payButtonText).click();
    await fillGovUkCardDetails({
      page,
      cardNumber: cards.successful_card_number,
    });
    await page.locator("#confirm").click();
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

    await expect(page.getByText("Application sent")).toBeVisible();
    await expect(page.getByText(paymentId!)).toBeVisible();
  });

  test("a retry attempt for a failed GOV.UK payment", async ({ page }) => {
    const sessionId = await navigateToPayComponent(page);
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
    await page.locator("#confirm").click();
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

    await expect(page.getByText("Application sent")).toBeVisible();
    await expect(page.getByText(paymentId)).toBeVisible();
  });

  test("a retry attempt for a cancelled GOV.UK payment", async ({ page }) => {
    const sessionId = await navigateToPayComponent(page);
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
    await page.locator("#confirm").click();
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

    await expect(page.getByText("Application sent")).toBeVisible();
    await expect(page.getByText(paymentId!)).toBeVisible();
  });

  test("a retry attempt for an abandoned GOV.UK payment", async ({ page }) => {
    const sessionId = await navigateToPayComponent(page);
    context.sessionIds!.push(sessionId);

    await page.getByText(payButtonText).click();
    await fillGovUkCardDetails({
      page,
      cardNumber: cards.successful_card_number,
    });

    // abandon the payment and return to PlanX
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

    // retry the payment
    await page.getByText("Retry payment").click();
    await page.getByText("Continue with your payment").click();
    await page.locator("#confirm").click();

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

    await expect(page.getByText("Application sent")).toBeVisible();
    await expect(page.getByText(paymentId!)).toBeVisible();
  });

  test("a retry attempt for an abandoned and then cancelled GOV.UK payment", async ({
    page,
  }) => {
    const sessionId = await navigateToPayComponent(page);
    context.sessionIds!.push(sessionId);

    // begin a payment
    await page.getByText(payButtonText).click();
    await fillGovUkCardDetails({
      page,
      cardNumber: cards.successful_card_number,
    });

    // abandon the payment and return to PlanX
    await page.goto(previewURL);

    // resume the payment and cancel it
    await page.getByText("Retry payment").click();
    await page.getByText("Cancel and go back to try the payment again").click();

    // retry and complete the payment
    await page.getByText("Retry payment").click();
    await fillGovUkCardDetails({
      page,
      cardNumber: cards.successful_card_number,
    });
    await page.locator("#confirm").click();
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
    await expect(page.getByText("Application sent")).toBeVisible();
  });

  test("navigating back to the pay component after a successful payment", async ({
    page,
  }) => {
    const sessionId = await navigateToPayComponent(page);
    context.sessionIds!.push(sessionId);

    await page.getByText(payButtonText).click();
    await fillGovUkCardDetails({
      page,
      cardNumber: cards.successful_card_number,
    });
    await page.locator("#confirm").click();
    const { paymentId: actualPaymentId } = await waitForPaymentResponse(
      page,
      context,
    );
    await expect(page.getByText("Application sent")).toBeVisible();
    await expect(page.getByText(actualPaymentId)).toBeVisible();

    // try going back to the payment page
    await page.goBack();
    await expect(
      page.locator("h1").getByText("Your payment session has expired"),
    ).toBeVisible();
  });
});

async function navigateToPayComponent(page: Page): Promise<string> {
  await page.goto(previewURL);
  await page.getByLabel("Pay test").fill("Test");
  await page.getByTestId("continue-button").click();
  return getSessionId(page);
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
