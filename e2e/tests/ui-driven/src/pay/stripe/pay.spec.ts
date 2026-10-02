import { expect, test } from "@playwright/test";
import type Stripe from "stripe";

import { completeStripeCheckoutSession } from "../../../../shared/stripe/completeCheckoutSession.js";
import {
  contextDefaults,
  getGraphQLClient,
  setUpTestContext,
  tearDownTestContext,
} from "../../helpers/context.js";
import type { TestContext } from "../../helpers/types.js";
import payFlow from "../../mocks/flows/pay-flow.json" with { type: "json" };
import {
  findSession,
  navigateToPayComponent,
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

  test.afterAll(async () => {
    await tearDownTestContext();
  });

  test("a successful payment", async ({ page }) => {
    const sessionId = await navigateToPayComponent(page, context);
    context.sessionIds!.push(sessionId);

    const { paymentIntent } = await payViaStripe(page);
    expect(paymentIntent.status).toEqual("succeeded");

    await expect(page.getByText("Form sent")).toBeVisible();

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
    await expect(page.getByText("Form sent")).toBeVisible();

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
    await expect(page.getByText("Form sent")).toBeVisible();

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
    await expect(page.getByText("Form sent")).toBeVisible();

    await expectPaymentReference({ sessionId, paymentIntent });
  });
});
