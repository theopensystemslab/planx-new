import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";
import type Stripe from "stripe";
import { v4 as uuidV4 } from "uuid";

import { completeStripeCheckoutSession } from "../../../../../shared/stripe/completeCheckoutSession.js";
import {
  contextDefaults,
  getGraphQLClient,
  setUpTestContext,
  tearDownTestContext,
} from "../../../helpers/context.js";
import type { TestContext } from "../../../helpers/types.js";
import inviteToPayFlow from "../../invite-to-pay/invite-to-pay-flow.js";
import {
  markPaymentRequestAsExpired,
  navigateToPaymentRequestPage,
  setupPaymentRequest,
} from "../../invite-to-pay/payment-request.js";
import {
  getCheckoutSessionStatus,
  returnFromStripe,
  startStripeCheckout,
} from "../helpers.js";
import { getStripePaymentId } from "./helpers.js";

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

const PAYMENT_NOT_FOUND_TEXT = "Sorry, we can't find that payment link";

const paymentNotCompletedWarning =
  "Your payment wasn't completed. You can try again when you're ready.";

test.describe("Stripe nominee journey @regression", () => {
  const adminGQLClient = getGraphQLClient();

  const expectPaymentRequestToBePaid = ({
    paymentRequestId,
    paymentIntent,
  }: {
    paymentRequestId: string;
    paymentIntent: Stripe.PaymentIntent;
  }) =>
    expect
      .poll(() => getStripePaymentId({ paymentRequestId, adminGQLClient }))
      .toEqual(paymentIntent.id);

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

  test("paying a payment request, and refreshing the page", async ({
    page,
    request,
  }) => {
    const { paymentRequest } = await setupPaymentRequest(request, context);
    await navigateToPaymentRequestPage(paymentRequest, page, context);
    await expectPaymentRequestDetails(page);

    const checkoutSessionId = await startStripeCheckout(page);
    const paymentIntent =
      await completeStripeCheckoutSession(checkoutSessionId);
    await returnFromStripe({ page, checkoutSessionId, outcome: "success" });

    await expectPaidPaymentRequest({ page, paymentIntent });
    await expectPaymentRequestToBePaid({
      paymentRequestId: paymentRequest.id,
      paymentIntent,
    });

    await page.reload();
    await expectPaidPaymentRequest({ page, paymentIntent });
  });

  // Only the webhook can mark the payment request as paid here
  test("paying a payment request without returning to PlanX", async ({
    page,
    request,
  }) => {
    const { paymentRequest } = await setupPaymentRequest(request, context);
    await navigateToPaymentRequestPage(paymentRequest, page, context);

    const checkoutSessionId = await startStripeCheckout(page);
    const paymentIntent =
      await completeStripeCheckoutSession(checkoutSessionId);
    await expectPaymentRequestToBePaid({
      paymentRequestId: paymentRequest.id,
      paymentIntent,
    });

    await navigateToPaymentRequestPage(paymentRequest, page, context);
    await expectPaidPaymentRequest({ page, paymentIntent });
  });

  test("cancelling a payment, then retrying", async ({ page, request }) => {
    const { paymentRequest } = await setupPaymentRequest(request, context);
    await navigateToPaymentRequestPage(paymentRequest, page, context);

    const cancelledCheckoutSessionId = await startStripeCheckout(page);
    await returnFromStripe({
      page,
      checkoutSessionId: cancelledCheckoutSessionId,
      outcome: "cancel",
    });
    await expect(page.getByText(paymentNotCompletedWarning)).toBeVisible();
    await expect(page.getByRole("button", { name: "Pay now" })).toBeVisible();

    const checkoutSessionId = await startStripeCheckout(page);
    expect(checkoutSessionId).not.toEqual(cancelledCheckoutSessionId);
    const paymentIntent =
      await completeStripeCheckoutSession(checkoutSessionId);
    await returnFromStripe({ page, checkoutSessionId, outcome: "success" });

    await expectPaidPaymentRequest({ page, paymentIntent });
    expect(await getCheckoutSessionStatus(cancelledCheckoutSessionId)).toEqual(
      "expired",
    );
  });

  // Starting a new payment expires the earlier Checkout Session, so it can't be paid
  test("returning with an earlier Checkout Session after starting a new one", async ({
    page,
    request,
  }) => {
    const { paymentRequest } = await setupPaymentRequest(request, context);
    await navigateToPaymentRequestPage(paymentRequest, page, context);
    const staleCheckoutSessionId = await startStripeCheckout(page);

    await navigateToPaymentRequestPage(paymentRequest, page, context);
    await startStripeCheckout(page);
    expect(await getCheckoutSessionStatus(staleCheckoutSessionId)).toEqual(
      "expired",
    );

    await returnFromStripe({
      page,
      checkoutSessionId: staleCheckoutSessionId,
      outcome: "success",
    });
    await expect(page.getByText(paymentNotCompletedWarning)).toBeVisible();
    await expect(page.getByRole("button", { name: "Pay now" })).toBeVisible();
  });

  test("navigating to a URL with an invalid ID", async ({ page }) => {
    await page.goto(
      `/${context.team.slug}/${context.flow!.slug}/pay?analytics=false&paymentRequestId=${uuidV4()}`,
    );
    await expect(page.getByText(PAYMENT_NOT_FOUND_TEXT)).toBeVisible();
  });

  test("navigating to a URL without a paymentRequestId", async ({ page }) => {
    await page.goto(
      `/${context.team.slug}/${context.flow!.slug}/pay?analytics=false`,
    );
    await expect(page.getByText(PAYMENT_NOT_FOUND_TEXT)).toBeVisible();
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

async function expectPaymentRequestDetails(page: Page) {
  await expect(
    page.getByRole("heading", { name: "Pay", exact: true }),
  ).toBeVisible();
  await expect(
    page.locator("#main-content").getByText("Invite to pay test"),
  ).toBeVisible();
  await expect(page.getByText("123, Test Street, Testville")).toBeVisible();
  await expect(
    page.getByText(
      "Add a verandah or deck and changes to internal walls or layout",
    ),
  ).toBeVisible();
  await expect(page.getByTestId("fee-breakdown-table")).toBeVisible();
  await expect(page.getByRole("button", { name: "Pay now" })).toBeVisible();
}

async function expectPaidPaymentRequest({
  page,
  paymentIntent,
}: {
  page: Page;
  paymentIntent: Stripe.PaymentIntent;
}) {
  await expect(page.getByText("Payment received")).toBeVisible();
  await expect(page.getByText(paymentIntent.id)).toBeVisible();
  await expect(page.getByRole("button", { name: "Pay now" })).toBeHidden();
}
