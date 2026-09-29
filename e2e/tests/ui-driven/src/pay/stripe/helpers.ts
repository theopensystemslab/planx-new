import type { SessionData } from "@opensystemslab/planx-core/types";
import type { Page } from "@playwright/test";
import type { GraphQLClient } from "graphql-request";
import { gql } from "graphql-request";
import type Stripe from "stripe";

import { getStripeTestClient } from "../../../../shared/stripe/client.js";
import {
  completeStripeCheckoutSession,
  getCheckoutSessionId,
} from "../../../../shared/stripe/completeCheckoutSession.js";
import { getSessionId } from "../../helpers/globalHelpers.js";
import type { TestContext } from "../../helpers/types.js";
import { fillInEmail } from "../../helpers/userActions.js";

/**
 * Pay via Stripe, returning to PlanX as a real applicant would
 *
 * @description
 * The browser never loads hosted Checkout (bot protection blocks automated testing)
 * Instead the Checkout Session is completed via the Stripe SDK, and the browser is
 * sent to the session's success_url, exactly where Stripe would have redirected it
 */
export async function payViaStripe(page: Page): Promise<{
  checkoutSessionId: string;
  paymentIntent: Stripe.PaymentIntent;
}> {
  await page.route("https://checkout.stripe.com/**", (route) => route.abort());
  const checkoutRequest = page.waitForRequest("https://checkout.stripe.com/**");

  await page.getByText("Pay now").click();

  const checkoutSessionId = getCheckoutSessionId((await checkoutRequest).url());
  const paymentIntent = await completeStripeCheckoutSession(checkoutSessionId);

  const { success_url } =
    await getStripeTestClient().checkout.sessions.retrieve(checkoutSessionId);
  if (!success_url) {
    throw Error(`No success_url on Checkout Session ${checkoutSessionId}`);
  }

  await setStripeReferrer(page);
  await page.goto(
    success_url.replace("{CHECKOUT_SESSION_ID}", checkoutSessionId),
  );

  return { checkoutSessionId, paymentIntent };
}

export async function navigateToPayComponent(
  page: Page,
  context: TestContext,
): Promise<string> {
  await page.goto(
    `/${context.team.slug}/${context.flow!.slug}/published?analytics=false`,
  );
  await fillInEmail({ page, context });
  await page.getByTestId("continue-button").click();
  await page.getByLabel("Pay test").fill("Test");
  await page.getByTestId("continue-button").click();
  return getSessionId(page);
}

export async function findSession({
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

/**
 * Mock the document.referrer property within this test context
 *
 * referrer is not set when running in localhost, but our frontend
 * depends on this header to skip the Resume page on return from Stripe
 *
 * Please see apps/editor.planx.uk/src/pages/Preview/Resume/index.tsx
 */
async function setStripeReferrer(page: Page) {
  await page.addInitScript(() => {
    Object.defineProperty(document, "referrer", {
      get: () => "https://checkout.stripe.com/",
    });
  });
}
