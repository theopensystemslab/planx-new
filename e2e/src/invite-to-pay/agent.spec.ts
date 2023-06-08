import { test, expect } from "@playwright/test";
import {
  setFeatureFlag,
  addSessionToContext,
  modifyFlow,
} from "../helpers";
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

let context: Context = {
  ...contextDefaults,
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

  test.beforeEach(
    async ({ page }) => await setFeatureFlag(page, "INVITE_TO_PAY")
  );

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
    await page.getByText("Send invitation to pay").click();
    await page.waitForLoadState("networkidle");

    const errorMessage = await page.getByText(
      "Error generating payment request, please try again"
    );
    await expect(errorMessage).not.toBeVisible();

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
        name: "Your application is locked",
      })
    ).toBeVisible();
    await expect(secondPage.getByTestId("continue-button")).not.toBeVisible();
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
    await expect(reconciliationText).not.toBeVisible();

    // Locked application message displayed
    await expect(
      await secondPage.getByRole("heading", {
        name: "Your application is locked",
      })
    ).toBeVisible();
    await expect(secondPage.getByTestId("continue-button")).not.toBeVisible();
  });
});
