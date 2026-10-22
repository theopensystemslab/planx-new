import type { BrowserContext, Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

import { completeStripeCheckoutSession } from "../../../../../shared/stripe/completeCheckoutSession.js";
import {
  contextDefaults,
  getGraphQLClient,
  setUpTestContext,
  tearDownTestContext,
} from "../../../helpers/context.js";
import { addSessionToContext } from "../../../helpers/globalHelpers.js";
import type { TestContext } from "../../../helpers/types.js";
import {
  clickContinue,
  returnToSession,
  saveSession,
} from "../../../helpers/userActions.js";
import {
  answerInviteToPayForm,
  getPaymentRequestBySessionId,
  makePaymentRequest,
  navigateToPayComponent,
} from "../../invite-to-pay/helpers.js";
import inviteToPayFlow from "../../invite-to-pay/invite-to-pay-flow.js";
import { mockPaymentRequest } from "../../invite-to-pay/mocks.js";
import {
  getCheckoutSessionStatus,
  returnFromStripe,
  startStripeCheckout,
} from "../helpers.js";

let context: TestContext = {
  ...contextDefaults,
  paymentProvider: "stripe",
  flow: {
    slug: "invite-to-pay-test",
    name: "Invite to pay test",
    data: inviteToPayFlow,
    hasSendComponent: true,
  },
  sessionIds: [],
};

const paymentNotCompletedWarning =
  "Your payment wasn't completed. You can try again when you're ready.";

test.describe("Stripe agent journey @regression", () => {
  const adminGQLClient = getGraphQLClient();

  test.beforeAll(async () => {
    try {
      context = await setUpTestContext(context);
    } catch (e) {
      await tearDownTestContext();
      throw e;
    }
  });

  test.afterAll(async () => {
    await tearDownTestContext();
  });

  test("agent can send a payment request", async ({ page }) => {
    await navigateToPayComponent(page, context);
    const sessionId = await addSessionToContext(page, context);

    await sendPaymentRequest(page);

    const paymentRequest = await getPaymentRequestBySessionId({
      sessionId,
      adminGQLClient,
    });
    expect(paymentRequest).toMatchObject(mockPaymentRequest);
  });

  // Differs from GOV.UK Pay - inviting expires any Checkout Session the agent has left open
  test("agent can send a payment request after cancelling a Stripe payment", async ({
    page,
  }) => {
    await navigateToPayComponent(page, context);
    const sessionId = await addSessionToContext(page, context);

    const checkoutSessionId = await startStripeCheckout(page);
    await returnFromStripe({ page, checkoutSessionId, outcome: "cancel" });
    await expect(page.getByText(paymentNotCompletedWarning)).toBeVisible();

    await sendPaymentRequest(page);

    const paymentRequest = await getPaymentRequestBySessionId({
      sessionId,
      adminGQLClient,
    });
    expect(paymentRequest).toBeDefined();
    expect(await getCheckoutSessionStatus(checkoutSessionId)).toEqual(
      "expired",
    );
  });

  test("agent cannot make changes after sending a payment request - session is locked", async ({
    page: firstPage,
    context: browserContext,
  }) => {
    const sessionId = await makePaymentRequest({ page: firstPage, context });

    const resumeLink = `/${context.team.slug}/${context.flow!.slug}/published?analytics=false&sessionId=${sessionId}`;
    const secondPage = await browserContext.newPage();
    await secondPage.goto(resumeLink);
    await expect(
      secondPage.getByRole("heading", { name: "Resume your form" }),
    ).toBeVisible();
    await secondPage.getByLabel("Email address").fill(context.user.email);
    await secondPage.getByTestId("continue-button").click();

    await expect(
      secondPage.getByRole("heading", {
        name: "Sorry, you can't make changes to this form",
      }),
    ).toBeVisible();
    await expect(secondPage.getByTestId("continue-button")).toBeHidden();
  });

  // Differs from GOV.UK Pay - inviting expires the open Checkout Session, so it can no longer be paid
  test("agent can send a payment request while a Stripe payment is open in another tab", async ({
    page,
    context: browserContext,
  }) => {
    const {
      sessionId,
      tabs: [tab1, tab2],
    } = await openTwoTabsAtPay({ page, browserContext });

    const openCheckoutSessionId = await startStripeCheckout(tab1);

    await sendPaymentRequest(tab2);

    const paymentRequest = await getPaymentRequestBySessionId({
      sessionId,
      adminGQLClient,
    });
    expect(paymentRequest).toBeDefined();
    expect(await getCheckoutSessionStatus(openCheckoutSessionId)).toEqual(
      "expired",
    );
    await expect(
      completeStripeCheckoutSession(openCheckoutSessionId),
    ).rejects.toThrow();
  });

  // TODO: Enable once a locked session's 409 is no longer shown as "Online payments are not enabled"
  test.fixme("agent cannot make a payment after sending a payment request in another tab", async ({
    page,
    context: browserContext,
  }) => {
    const {
      tabs: [tab1, tab2],
    } = await openTwoTabsAtPay({ page, browserContext });

    await sendPaymentRequest(tab1);

    await tab2.getByText("Pay now").click();
    await expect(
      tab2.getByText("Cannot initialise a new payment for locked session"),
    ).toBeVisible();
    await expect(tab2.getByTestId("continue-button")).toBeHidden();
  });
});

/**
 * Save the session, then resume it in two new tabs, both at the Pay component
 */
async function openTwoTabsAtPay({
  page,
  browserContext,
}: {
  page: Page;
  browserContext: BrowserContext;
}): Promise<{ sessionId: string; tabs: [Page, Page] }> {
  await navigateToPayComponent(page, context);
  await addSessionToContext(page, context);
  const sessionId = await saveSession({ page, context });
  expect(sessionId).toBeDefined();

  const tabs: [Page, Page] = [
    await resumeSessionInNewTab({ browserContext, sessionId: sessionId! }),
    await resumeSessionInNewTab({ browserContext, sessionId: sessionId! }),
  ];

  return { sessionId: sessionId!, tabs };
}

async function resumeSessionInNewTab({
  browserContext,
  sessionId,
}: {
  browserContext: BrowserContext;
  sessionId: string;
}): Promise<Page> {
  const tab = await browserContext.newPage();
  await returnToSession({ page: tab, context, sessionId });
  // Skip the review page
  await clickContinue({ page: tab });
  await expect(
    tab.getByRole("button", { name: "Invite someone else to pay" }),
  ).toBeVisible();

  return tab;
}

async function sendPaymentRequest(page: Page) {
  const toggleInviteToPayButton = page.getByRole("button", {
    name: "Invite someone else to pay",
  });
  await expect(toggleInviteToPayButton).toBeEnabled();
  await toggleInviteToPayButton.click();
  await expect(page.getByText("Invite someone else to pay")).toBeVisible();

  await answerInviteToPayForm(page);
  const inviteResponse = page.waitForResponse((response) =>
    response.url().includes("/invite-to-pay/"),
  );
  await page.getByRole("button", { name: "Send invitation to pay" }).click();
  expect((await inviteResponse).ok()).toBe(true);

  await expect(page.getByText("Payment invitation sent")).toBeVisible();
}
