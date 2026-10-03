import { expect, test } from "@playwright/test";
import type Stripe from "stripe";

import { completeStripeCheckoutSession } from "../../../../shared/stripe/completeCheckoutSession.js";
import {
  contextDefaults,
  getGraphQLClient,
  setUpTestContext,
  tearDownTestContext,
} from "../../helpers/context.js";
import { setFeatureFlag } from "../../helpers/globalHelpers.js";
import type { TestContext } from "../../helpers/types.js";
import payFlow from "../../mocks/flows/pay-flow.json" with { type: "json" };
import {
  expectSessionResumedAtPay,
  findSession,
  getCheckoutSessionStatus,
  navigateToPayComponent,
  navigateToResumeURL,
  payViaStripe,
  resumeSessionViaMagicLink,
  returnFromStripe,
  startStripeCheckout,
} from "./helpers.js";

let context: TestContext = {
  ...contextDefaults,
  paymentProvider: "stripe",
  flow: {
    slug: "pay-test",
    name: "Pay test",
    data: payFlow,
    hasSendComponent: true,
  },

  sessionIds: [],
};

const payNodeId = "NNdOGmxgfG";

const paymentCancelledWarning =
  "Your payment wasn't completed. You can try again when you're ready.";

test.describe("Stripe integration @regression", () => {
  const adminGQLClient = getGraphQLClient();

  const expectPaymentReference = async ({
    sessionId,
    paymentIntent,
  }: {
    sessionId: string;
    paymentIntent: Stripe.PaymentIntent;
  }) =>
    expect
      .poll(async () => {
        const session = await findSession({ adminGQLClient, sessionId });
        return session?.data?.breadcrumbs?.[payNodeId]?.data?.[
          "application.fee.reference"
        ];
      })
      .toEqual(paymentIntent.id);

  test.beforeAll(async () => {
    try {
      context = await setUpTestContext(context);
    } catch (e) {
      await tearDownTestContext();
      throw e;
    }
  });

  // TODO: Drop when Stripe payments are no longer behind a feature flag
  test.beforeEach(async ({ page }) => {
    await setFeatureFlag(page, "STRIPE_MIGRATION");
  });

  test.afterAll(async () => {
    await tearDownTestContext();
  });

  test("a successful payment", async ({ page }) => {
    const sessionId = await navigateToPayComponent(page, context);
    context.sessionIds!.push(sessionId);

    const { paymentIntent } = await payViaStripe(page);
    expect(paymentIntent.status).toEqual("succeeded");

    await expect(page.getByText("Form sent", { exact: true })).toBeVisible();

    await expectPaymentReference({ sessionId, paymentIntent });
  });

  // Stripe shows a decline on hosted Checkout, so the applicant retries on the same session
  test("a retry attempt for a declined Stripe payment", async ({ page }) => {
    const sessionId = await navigateToPayComponent(page, context);
    context.sessionIds!.push(sessionId);

    const checkoutSessionId = await startStripeCheckout(page);

    const declinedPayment = await completeStripeCheckoutSession(
      checkoutSessionId,
      "declined",
    );
    expect(declinedPayment.status).toEqual("requires_payment_method");

    const paymentIntent = await completeStripeCheckoutSession(
      checkoutSessionId,
      "success",
    );
    expect(paymentIntent.status).toEqual("succeeded");

    await returnFromStripe({ page, checkoutSessionId, outcome: "success" });
    await expect(page.getByText("Form sent", { exact: true })).toBeVisible();

    await expectPaymentReference({ sessionId, paymentIntent });
  });

  test("a retry attempt for a cancelled Stripe payment", async ({ page }) => {
    const sessionId = await navigateToPayComponent(page, context);
    context.sessionIds!.push(sessionId);

    const cancelledCheckoutSessionId = await startStripeCheckout(page);
    await returnFromStripe({
      page,
      checkoutSessionId: cancelledCheckoutSessionId,
      outcome: "cancel",
    });
    await expect(page.getByText(paymentCancelledWarning)).toBeVisible();

    const { checkoutSessionId, paymentIntent } = await payViaStripe(page);
    expect(checkoutSessionId).not.toEqual(cancelledCheckoutSessionId);
    await expect(page.getByText("Form sent", { exact: true })).toBeVisible();
    expect(await getCheckoutSessionStatus(cancelledCheckoutSessionId)).toEqual(
      "expired",
    );

    await expectPaymentReference({ sessionId, paymentIntent });
  });

  test("a retry attempt for an abandoned and then cancelled Stripe payment", async ({
    page,
  }) => {
    const sessionId = await navigateToPayComponent(page, context);
    context.sessionIds!.push(sessionId);

    // Begin a payment, abandon it and return to PlanX via a magic link
    await startStripeCheckout(page);
    await resumeSessionViaMagicLink({ page, context, sessionId });

    // Start a new payment and cancel it
    const cancelledCheckoutSessionId = await startStripeCheckout(page);
    await returnFromStripe({
      page,
      checkoutSessionId: cancelledCheckoutSessionId,
      outcome: "cancel",
    });
    await expect(page.getByText(paymentCancelledWarning)).toBeVisible();

    // Retry and complete the payment
    const { paymentIntent } = await payViaStripe(page);
    await expect(page.getByText("Form sent", { exact: true })).toBeVisible();

    await expectPaymentReference({ sessionId, paymentIntent });
  });

  test("a retry attempt for an abandoned Stripe payment", async ({ page }) => {
    const sessionId = await navigateToPayComponent(page, context);
    context.sessionIds!.push(sessionId);

    // Begin a payment, abandon it and return to PlanX via a magic link
    const abandonedCheckoutSessionId = await startStripeCheckout(page);
    await navigateToResumeURL({ page, context, sessionId });
    await expectSessionResumedAtPay({ page, context, sessionId });

    const { paymentIntent } = await payViaStripe(page);
    await expect(page.getByText("Form sent", { exact: true })).toBeVisible();
    expect(await getCheckoutSessionStatus(abandonedCheckoutSessionId)).toEqual(
      "expired",
    );

    await expectPaymentReference({ sessionId, paymentIntent });
  });

  test("navigating back to the pay component after a successful payment", async ({
    page,
  }) => {
    const sessionId = await navigateToPayComponent(page, context);
    context.sessionIds!.push(sessionId);

    const { checkoutSessionId, paymentIntent } = await payViaStripe(page);
    await expect(page.getByText("Form sent", { exact: true })).toBeVisible();

    // Returning from Stripe a second time does not take another payment
    await returnFromStripe({ page, checkoutSessionId, outcome: "success" });
    await expect(page.getByText("Form sent", { exact: true })).toBeVisible();
    await expect(page.getByText("Pay now")).toBeHidden();

    await expectPaymentReference({ sessionId, paymentIntent });
  });

  // A user who abandons a payment by hitting "back" in their browser should
  // return to their session, not start a new one
  test("navigating back from Stripe via the browser during an in-flight payment", async ({
    page,
  }) => {
    const sessionId = await navigateToPayComponent(page, context);
    context.sessionIds!.push(sessionId);

    await startStripeCheckout(page);
    await page.goBack();

    await expectSessionResumedAtPay({ page, context, sessionId });
  });

  // As above, but navigating directly to the resume URL rather than using "back"
  test("navigating to the resume URL during an in-flight payment", async ({
    page,
  }) => {
    const sessionId = await navigateToPayComponent(page, context);
    context.sessionIds!.push(sessionId);

    await startStripeCheckout(page);
    await navigateToResumeURL({ page, context, sessionId });

    await expectSessionResumedAtPay({ page, context, sessionId });
  });

  // An earlier Checkout Session left open in another tab can't be paid once the applicant retries
  test("paying in a previous Checkout Session after a retry", async ({
    page,
  }) => {
    const sessionId = await navigateToPayComponent(page, context);
    context.sessionIds!.push(sessionId);

    const abandonedCheckoutSessionId = await startStripeCheckout(page);
    await navigateToResumeURL({ page, context, sessionId });
    await expectSessionResumedAtPay({ page, context, sessionId });

    const checkoutSessionId = await startStripeCheckout(page);
    await expect(
      completeStripeCheckoutSession(abandonedCheckoutSessionId),
    ).rejects.toThrow();

    const paymentIntent =
      await completeStripeCheckoutSession(checkoutSessionId);
    await returnFromStripe({ page, checkoutSessionId, outcome: "success" });
    await expect(page.getByText("Form sent", { exact: true })).toBeVisible();

    await expectPaymentReference({ sessionId, paymentIntent });
  });

  // Returning with an earlier (now expired) Checkout Session doesn't resume it
  test("a stale Stripe session ID from an earlier attempt is ignored", async ({
    page,
  }) => {
    const sessionId = await navigateToPayComponent(page, context);
    context.sessionIds!.push(sessionId);

    const staleCheckoutSessionId = await startStripeCheckout(page);
    await navigateToResumeURL({ page, context, sessionId });
    await expectSessionResumedAtPay({ page, context, sessionId });

    // ! retry expires the earlier Checkout Session...
    await startStripeCheckout(page);

    // ...so returning with it is treated as an incomplete payment
    await returnFromStripe({
      page,
      checkoutSessionId: staleCheckoutSessionId,
      outcome: "success",
    });
    await expect(page.getByText(paymentCancelledWarning)).toBeVisible();
    await expect(page.getByText("Form sent", { exact: true })).toBeHidden();

    const { paymentIntent } = await payViaStripe(page);
    await expect(page.getByText("Form sent", { exact: true })).toBeVisible();

    await expectPaymentReference({ sessionId, paymentIntent });
  });
});
