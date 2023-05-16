import { test, expect } from "@playwright/test";
import { setFeatureFlag, addSessionToContext } from "../helpers";
import inviteToPayFlow from "../flows/invite-to-pay-flow";
import {
  Context,
  getGraphQLClient,
  setUpTestContext,
  tearDownTestContext,
} from "../context";
import { answerInviteToPayForm, getPaymentRequestBySessionId, navigateToPayComponent } from "./helpers";
import { mockPaymentRequest } from "./mocks";

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

  test.afterAll(async () => {
    await tearDownTestContext(context);
  });

  test("sending a payment request", async ({ page }) => {
    await setFeatureFlag(page, "INVITE_TO_PAY");
    await navigateToPayComponent(page, context);
    const sessionId = await addSessionToContext(page, context);

    const toggleInviteToPayButton = page.getByRole("button", { name: "Invite someone else to pay for this application" });
    expect(toggleInviteToPayButton).toBeVisible();
    await toggleInviteToPayButton.click();
    const inviteToPayFormHeader = await page.getByText("Invite someone else to pay for this application");
    expect(inviteToPayFormHeader).toBeVisible();

    await answerInviteToPayForm(page);
    await page.getByText("Send invitation to pay").click();
    await page.waitForLoadState("networkidle");
    const errorMessage = await page.getByText("Error generating payment request, please try again");
    expect(errorMessage).not.toBeVisible();

    const paymentRequest = await getPaymentRequestBySessionId({ sessionId, adminGQLClient });
    expect(paymentRequest).toBeDefined();
    expect(paymentRequest).toMatchObject(mockPaymentRequest);

    const successMessage = await page.getByText("Payment invitation sent");
    expect(successMessage).toBeVisible();
  });

  test("agent cannot send a payment request after initialising a normal payment", async ({ page }) => {
    await setFeatureFlag(page, "INVITE_TO_PAY");
    await navigateToPayComponent(page, context);
    await addSessionToContext(page, context);
    const toggleInviteToPayButton = page.getByRole("button", { name: "Invite someone else to pay for this application" });

    await page.getByText("Pay now using GOV.UK Pay").click();
    await page.getByText("Cancel payment").click();
    await page.getByText("Continue").click();
    await page.getByLabel("email").fill(context.user.email);
    await page.getByText("Continue").click();
    await page.waitForLoadState("networkidle");
    expect(toggleInviteToPayButton).toBeDisabled();
  });
});