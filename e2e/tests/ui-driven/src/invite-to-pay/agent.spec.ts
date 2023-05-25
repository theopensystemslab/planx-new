import { test, expect, Page, BrowserContext } from "@playwright/test";
import { setFeatureFlag, addSessionToContext, modifyFlow } from "../helpers";
import inviteToPayFlow from "../flows/invite-to-pay-flow";
import {
  Context,
  contextDefaults,
  getGraphQLClient,
  setUpTestContext,
  tearDownTestContext,
} from "../context";
import {
  answerInviteToPayForm,
  getPaymentRequestBySessionId,
  makePaymentRequest,
  navigateToPayComponent,
} from "./helpers";
import { mockPaymentRequest, modifiedInviteToPayFlow } from "./mocks";
import { saveSession } from "../helpers";
import { returnToSession } from "../helpers";
import { clickContinue } from "../helpers";

let context: Context = {
  ...contextDefaults,
  flow: {
    slug: "invite-to-pay-test",
    data: inviteToPayFlow,
  },
  sessionIds: [], // used to collect and clean up sessions
};

test.describe("Agent journey", async () => {
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

  test.afterAll(async () => await tearDownTestContext(context));

  test("agent can send a payment request", async ({ page }) => {
    await navigateToPayComponent(page, context);
    const sessionId = await addSessionToContext(page, context);

    const toggleInviteToPayButton = page.getByRole("button", {
      name: "Invite someone else to pay for this application",
    });
    await expect(toggleInviteToPayButton).toBeVisible();
    await toggleInviteToPayButton.click();
    const inviteToPayFormHeader = await page.getByText(
      "Invite someone else to pay for this application"
    );
    await expect(inviteToPayFormHeader).toBeVisible();

    await answerInviteToPayForm(page);
    await page.getByRole("button", { name: "Send invitation to pay" }).click();
    await page.waitForLoadState("networkidle");

    const errorMessage = await page.getByText(
      "Error generating payment request, please try again"
    );
    await expect(errorMessage).toBeHidden();

    const paymentRequest = await getPaymentRequestBySessionId({
      sessionId,
      adminGQLClient,
    });
    expect(paymentRequest).toBeDefined();
    expect(paymentRequest).toMatchObject(mockPaymentRequest);

    const successMessage = await page.getByText("Payment invitation sent");
    await expect(successMessage).toBeVisible();
  });

  test("agent cannot send a payment request after initialising a normal payment", async ({
    page,
  }) => {
    await navigateToPayComponent(page, context);
    await addSessionToContext(page, context);
    const toggleInviteToPayButton = page.getByRole("button", {
      name: "Invite someone else to pay for this application",
    });

    await page.getByText("Pay now using GOV.UK Pay").click();
    await page.getByText("Cancel payment").click();
    await page.getByText("Continue").click();
    await page.getByLabel("email").fill(context.user.email);
    await page.getByText("Continue").click();
    await page.waitForLoadState("networkidle");

    await expect(toggleInviteToPayButton).toBeDisabled();
  });

  test("agent cannot make changes after sending a payment request - session is locked", async ({
    page: firstPage,
    context: browserContext,
  }) => {
    const sessionId = await makePaymentRequest({ page: firstPage, context });

    // Resume session
    const resumeLink = `/${context.team!.slug!}/${context.flow!
      .slug!}/preview?analytics=false&sessionId=${sessionId}`;
    const secondPage = await browserContext.newPage();
    await secondPage.goto(resumeLink);
    await expect(
      await secondPage.getByRole("heading", {
        name: "Resume your application",
      })
    ).toBeVisible();
    await secondPage.getByLabel("Email address").fill(context.user.email);
    await secondPage.getByTestId("continue-button").click();

    await expect(
      await secondPage.getByRole("heading", {
        name: "Sorry, you can't make changes to this application",
      })
    ).toBeVisible();
    await expect(secondPage.getByTestId("continue-button")).toBeHidden();
  });

  test("reconciliation does not apply to sessions with open payment requests", async ({
    page: firstPage,
    context: browserContext,
  }) => {
    const sessionId = await makePaymentRequest({ page: firstPage, context });

    // Make change to flow, publish it
    await modifyFlow({ context, modifiedFlow: modifiedInviteToPayFlow });

    // Navigate to resume session link
    const resumeLink = `/${context.team!.slug!}/${context.flow!
      .slug!}/preview?analytics=false&sessionId=${sessionId}`;
    const secondPage = await browserContext.newPage();
    await secondPage.goto(resumeLink);
    await expect(
      await secondPage.getByRole("heading", { name: "Resume your application" })
    ).toBeVisible();
    await secondPage.getByLabel("Email address").fill(context.user.email);
    await secondPage.getByTestId("continue-button").click();

    // Reconciliation ignored
    const reconciliationText = await secondPage.getByText(
      "This service has been updated since you last saved your application. We will ask you to answer any updated questions again when you continue."
    );
    await expect(reconciliationText).toBeHidden();

    // Locked application message displayed
    await expect(
      await secondPage.getByRole("heading", {
        name: "Sorry, you can't make changes to this application",
      })
    ).toBeVisible();
    await expect(secondPage.getByTestId("continue-button")).toBeHidden();
  });

  test("agent cannot make payment after sending a payment request in another tab", async ({
    page,
    context: browserContext,
  }) => {
    const {
      sessionId,
      tabs: [tab1, tab2],
    } = await parallelITPJourneys({ page, browserContext });

    // Make payment request in tab 1
    await tab1.getByTestId("invite-page-link").click();
    await answerInviteToPayForm(tab1);
    await tab1.getByRole("button", { name: "Send invitation to pay" }).click();
    await tab1.waitForResponse(
      (resp) => resp.url().includes("/v1/graphql") && resp.status() === 200
    );
    const paymentRequest = await getPaymentRequestBySessionId({
      sessionId,
      adminGQLClient,
    });
    await expect(paymentRequest).toBeDefined();

    // Attempt to make payment in tab 2...
    await tab2.getByText("Pay now using GOV.UK Pay").click();

    // ...and fail to do so
    const errorMessage = tab2.getByText(
      "Cannot initialise a new payment for locked session"
    );
    await expect(errorMessage).toBeVisible();
  });

  test("agent cannot generate payment request after starting payment in another tab", async ({
    page,
    context: browserContext,
  }) => {
    const {
      tabs: [tab1, tab2],
    } = await parallelITPJourneys({ page, browserContext });

    // Start to make payment in tab 1
    await tab1.getByText("Pay now using GOV.UK Pay").click();
    const govPayHeader = tab1.getByText("Enter card details");
    await expect(govPayHeader).toBeVisible();

    // Attempt to generate payment request in tab 2...
    await tab2.getByTestId("invite-page-link").click();
    await answerInviteToPayForm(tab2);
    await tab2.getByRole("button", { name: "Send invitation to pay" }).click();

    // ...and fail to do so
    const errorMessage = tab2.getByText(
      "Error generating payment request, please try again"
    );
    await expect(errorMessage).toBeVisible();
  });
});

const parallelITPJourneys = async ({
  page,
  browserContext,
}: {
  page: Page;
  browserContext: BrowserContext;
}): Promise<{ sessionId: string; tabs: [Page, Page] }> => {
  await navigateToPayComponent(page, context);
  await addSessionToContext(page, context);
  const sessionId = await saveSession({ page, context });
  expect(sessionId).toBeDefined();

  // Make two tabs, and proceed in parallel
  const tab1 = await browserContext.newPage();
  const tab2 = await browserContext.newPage();

  await returnToSession({ page: tab1, context, sessionId: sessionId! });
  await returnToSession({ page: tab2, context, sessionId: sessionId! });

  // Skip review page
  await clickContinue({ page: tab1 });
  await clickContinue({ page: tab2 });

  // Land back on pay component
  const tab1ToggleITPButton = tab1.getByRole("button", {
    name: "Invite someone else to pay for this application",
  });
  const tab2ToggleITPButton = tab2.getByRole("button", {
    name: "Invite someone else to pay for this application",
  });
  await expect(tab1ToggleITPButton).toBeVisible();
  await expect(tab2ToggleITPButton).toBeVisible();

  return {
    sessionId: sessionId!,
    tabs: [tab1, tab2],
  };
};
