import { test, expect } from "@playwright/test";
import { log } from "./helpers";
import type { Page } from "@playwright/test";
import payFlow from "./flows/pay-flow.json";
import { gql, GraphQLClient } from "graphql-request";
import type { GovUKPayment } from "@opensystemslab/planx-core/types/types";
import type { Context } from "./context";
import {
  getGraphQLClient,
  setUpTestContext,
  tearDownTestContext,
} from "./context";

let context: Context = {
  user: {
    firstName: "test",
    lastName: "test",
    email: "e2epaytest@test.com",
  },
  team: {
    name: "Buckinghamshire",
    slug: "buckinghamshire",
    logo: "https://placedog.net/250/250",
    primaryColor: "#F30415",
    homepage: "example.com",
  },
  flow: {
    slug: "pay-test",
    data: payFlow,
  },
  sessionIds: [], // used to collect and clean up sessions
};
const previewURL = `/${context.team!.slug!}/${context.flow!
  .slug!}/preview?analytics=false`;
// Test card numbers to be used in gov.uk sandbox environment
// reference: https://docs.payments.service.gov.uk/testing_govuk_pay/#if-you-39-re-using-a-test-39-sandbox-39-account
const cards = {
  successful_card_number: "4444333322221111",
  invalid_card_number: "4000000000000002",
};
const payButtonText = "Pay now using GOV.UK Pay";

test.describe("Payment flow", async () => {
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
    const { paymentId } = await waitForPaymentResponse(page);
    expect(paymentId).toBeTruthy();

    // ensure a audit log entry was created
    expect(
      await hasPaymentStatus({
        status: "success",
        paymentId: paymentId,
        adminGQLClient,
      })
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

    const { paymentId: failedPaymentRef } = await waitForPaymentResponse(page);
    expect(failedPaymentRef).toBeTruthy();

    // ensure a audit log entry was created
    expect(
      await hasPaymentStatus({
        status: "failed",
        paymentId: failedPaymentRef,
        adminGQLClient,
      })
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
    const { paymentId } = await waitForPaymentResponse(page);
    expect(paymentId).toBeTruthy();

    // ensure a audit log entry was created
    expect(
      await hasPaymentStatus({
        status: "success",
        paymentId: paymentId,
        adminGQLClient,
      })
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
    const { paymentId: failedPaymentRef } = await waitForPaymentResponse(page);
    expect(failedPaymentRef).toBeTruthy();

    // ensure a audit log entry was created
    expect(
      await hasPaymentStatus({
        status: "failed", // note: GovPay returns "failed" rather than "cancelled"
        paymentId: failedPaymentRef,
        adminGQLClient,
      })
    ).toBe(true);

    await page.getByText("Retry payment").click();
    await fillGovUkCardDetails({
      page,
      cardNumber: cards.successful_card_number,
    });
    await page.locator("#confirm").click();
    const { paymentId } = await waitForPaymentResponse(page);
    expect(paymentId).toBeTruthy();

    // ensure a audit log entry was created
    expect(
      await hasPaymentStatus({
        status: "success",
        paymentId: paymentId,
        adminGQLClient,
      })
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
      "created"
    );
    // ensure a audit log entry was created
    expect(
      await hasPaymentStatus({
        status: "created",
        paymentId: initialSession!.data.govUkPayment.payment_id,
        adminGQLClient,
      })
    ).toBe(true);

    // retry the payment
    await page.getByText("Retry payment").click();
    await page.getByText("Continue with your payment").click();
    await page.locator("#confirm").click();

    const { paymentId } = await waitForPaymentResponse(page);
    expect(paymentId).toBeTruthy();

    // ensure a audit log entry was created
    expect(
      await hasPaymentStatus({
        status: "success",
        paymentId,
        adminGQLClient,
      })
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
    const { paymentId: actualPaymentId } = await waitForPaymentResponse(page);

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
    const { paymentId: actualPaymentId } = await waitForPaymentResponse(page);
    await expect(page.getByText("Application sent")).toBeVisible();
    await expect(page.getByText(actualPaymentId)).toBeVisible();

    // try going back to the payment page
    await page.goBack();
    await expect(
      page.locator("h1").getByText("Your payment session has expired")
    ).toBeVisible();
  });
});

async function fillGovUkCardDetails({
  page,
  cardNumber,
}: {
  page: Page;
  cardNumber: string;
}) {
  await page.locator("#card-no").fill(cardNumber);
  await page.getByLabel("Month").fill("12");
  await page.getByLabel("Year").fill("2099");
  await page.getByLabel("Name on card").fill("Test t Test");
  await page.getByLabel("Card security code", { exact: false }).fill("123");

  await page.locator("#address-line-1").fill("Test");
  await page.locator("#address-line-2").fill("123");

  await page.getByLabel("Town or city").fill("Test");
  await page.getByLabel("Postcode").fill("HP111BB");
  await page
    .getByLabel("Email")
    .fill("simulate-delivered@notifications.service.gov.uk");
  await page.locator("button#submit-card-details").click();
}

async function navigateToPayComponent(page: Page): Promise<string> {
  await page.goto(previewURL);
  await page.getByLabel("Pay test").fill("Test");
  await page.getByTestId("continue-button").click();
  return getSessionId(page);
}

async function waitForPaymentResponse(
  page: Page
): Promise<{ paymentId: string; state?: { status: string } }> {
  const { payment_id: paymentId, state } = await page
    .waitForResponse((response) => {
      return response.url().includes(`pay/${context.team!.slug!}`);
    })
    .then((req) => req.json());
  if (!paymentId) throw new Error("Bad payment response");
  return { paymentId, state };
}

async function getSessionId(page: Page): Promise<string> {
  // the session id is not available in the url so find it in a test utility component
  const sessionId: string | null = await page
    .getByTestId("sessionId")
    .getAttribute("data-sessionid");
  if (!sessionId) throw new Error("Session ID not found on page");
  return sessionId!;
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
    const { payment_status: response } = await adminGQLClient.request(
      gql`
        query GetPaymentStatus(
          $paymentId: String!
          $status: payment_status_enum_enum!
        ) {
          payment_status(
            where: { payment_id: { _eq: $paymentId }, status: { _eq: $status } }
          ) {
            status
          }
        }
      `,
      { paymentId, status }
    );
    if (response.length === 1 && response[0].status) {
      return response[0].status === status;
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
}): Promise<{ data: { govUkPayment: GovUKPayment } } | undefined> {
  const { lowcal_sessions: response } = await adminGQLClient.request(
    gql`
      query FindLowcalSesion($sessionId: uuid!) {
        lowcal_sessions(where: { id: { _eq: $sessionId } }, limit: 1) {
          data
        }
      }
    `,
    { sessionId }
  );
  return response[0];
}
