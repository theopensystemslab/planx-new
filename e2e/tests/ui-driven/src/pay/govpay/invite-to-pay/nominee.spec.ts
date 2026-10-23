import { expect, test } from "@playwright/test";
import { v4 as uuidV4 } from "uuid";

import {
  contextDefaults,
  getGraphQLClient,
  setUpTestContext,
  tearDownTestContext,
} from "../../../helpers/context.js";
import type { TestContext } from "../../../helpers/types.js";
import { getPaymentRequestBySessionId } from "../../invite-to-pay/helpers.js";
import inviteToPayFlow from "../../invite-to-pay/invite-to-pay-flow.js";
import {
  markPaymentRequestAsExpired,
  markPaymentRequestAsPaid,
  navigateToPaymentRequestPage,
  setupPaymentRequest,
} from "../../invite-to-pay/payment-request.js";
import { cards, fillGovUkCardDetails } from "../helpers.js";

let context: TestContext = {
  ...contextDefaults,
  flow: {
    slug: "invite-to-pay-test",
    name: "Invite to pay test",
    data: inviteToPayFlow,
    hasSendComponent: true,
  },
  sessionIds: [], // used to collect and clean up sessions
};

const PAYMENT_NOT_FOUND_TEXT = "Sorry, we can't find that payment link";

const adminGQLClient = getGraphQLClient();

test.describe("Nominee journey @regression", () => {
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

  test("responding to a valid payment request", async ({ page, request }) => {
    const { paymentRequest, sessionId } = await setupPaymentRequest(
      request,
      context,
    );
    await navigateToPaymentRequestPage(paymentRequest, page, context);

    await expect(
      page.getByRole("heading", { name: "Pay", exact: true }),
    ).toBeVisible();
    await expect(
      page.locator("#main-content").getByText("Invite to pay test"),
    ).toBeVisible();
    await expect(page.getByText("123, Test Street, Testville")).toBeVisible();

    const formattedProjectType =
      "Add a verandah or deck and changes to internal walls or layout";
    await expect(page.getByText(formattedProjectType)).toBeVisible();

    await expect(page.getByTestId("fee-breakdown-table")).toBeVisible();

    const payButton = page.getByRole("button", {
      name: "Pay now",
    });
    await expect(payButton).toBeVisible();

    await payButton.click();
    await fillGovUkCardDetails({
      page,
      cardNumber: cards.successful_card_number,
    });
    await page.getByRole("button", { name: "Confirm payment" }).click();
    await page.waitForURL("**/invite-to-pay-test/**");

    await expect(page.getByText("Payment received")).toBeVisible();
    const updatedPaymentRequest = await getPaymentRequestBySessionId({
      sessionId,
      adminGQLClient,
    });
    expect(updatedPaymentRequest?.paidAt).toBeDefined();
  });

  test("navigating to a URL with an invalid ID", async ({ page }) => {
    const mockUUID = uuidV4();

    const invalidPaymentRequestURL = `/${context.team!.slug!}/${
      context.flow?.slug
    }/pay?analytics=false&paymentRequestId=${mockUUID}`;
    await page.goto(invalidPaymentRequestURL);
    await expect(page.getByText(PAYMENT_NOT_FOUND_TEXT)).toBeVisible();
  });

  test("navigating to a URL without a paymentRequestId", async ({ page }) => {
    const invalidPaymentRequestURL = `/${context.team!.slug!}/${context.flow?.slug}/pay?analytics=false`;
    await page.goto(invalidPaymentRequestURL);

    await expect(page.getByText(PAYMENT_NOT_FOUND_TEXT)).toBeVisible();
  });

  test("responding to a payment request which has been paid", async ({
    page,
    request,
  }) => {
    const { paymentRequest } = await setupPaymentRequest(request, context);
    await markPaymentRequestAsPaid(paymentRequest);
    await navigateToPaymentRequestPage(paymentRequest, page, context);

    await expect(page.getByText("Payment received")).toBeVisible();
    await expect(page.getByRole("button", { name: "Pay now" })).toBeHidden();
  });

  test("responding to a payment request which has been paid, after the expiry period", async ({
    page,
    request,
  }) => {
    const { paymentRequest } = await setupPaymentRequest(request, context);
    await markPaymentRequestAsPaid(paymentRequest);
    await markPaymentRequestAsExpired(paymentRequest);
    await navigateToPaymentRequestPage(paymentRequest, page, context);

    await expect(page.getByText("Payment received")).toBeVisible();
  });

  test("applicant viewing a payment request which has been paid", async ({
    page,
    request,
  }) => {
    const { paymentRequest } = await setupPaymentRequest(request, context);
    await markPaymentRequestAsPaid(paymentRequest);

    const inviteURL = `/${context.team!.slug!}/${context.flow?.slug}/pay/invite?analytics=false&paymentRequestId=${paymentRequest.id}`;
    await page.goto(inviteURL);

    await expect(
      page.getByRole("heading", { name: "Payment received" }),
    ).toBeVisible();
    await expect(
      page.getByText("Your application has been sent", { exact: false }),
    ).toBeVisible();
  });

  test("responding to a payment request which has expired", async ({
    page,
    request,
  }) => {
    const { paymentRequest } = await setupPaymentRequest(request, context);
    await markPaymentRequestAsExpired(paymentRequest);
    await navigateToPaymentRequestPage(paymentRequest, page, context);

    await expect(page.getByText(PAYMENT_NOT_FOUND_TEXT)).toBeVisible();
  });
});
