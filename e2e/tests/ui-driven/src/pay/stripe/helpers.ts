import type { SessionData } from "@opensystemslab/planx-core/types";
import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";
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
  const checkoutSessionId = await startStripeCheckout(page);
  const paymentIntent = await completeStripeCheckoutSession(checkoutSessionId);
  await returnFromStripe({ page, checkoutSessionId, outcome: "success" });

  return { checkoutSessionId, paymentIntent };
}

/**
 * Click "Pay now" and capture the Checkout Session PlanX creates
 *
 * We replace the Checkout page with a placeholder page, with a real browser
 * history entry. This mean an applicant can navigate "back" from Stripe
 */
export async function startStripeCheckout(page: Page): Promise<string> {
  await page.route("https://checkout.stripe.com/**", (route) =>
    route.fulfill({
      contentType: "text/html",
      body: "<h1>Stripe Checkout placeholder</h1>",
    }),
  );
  const checkoutRequest = page.waitForRequest("https://checkout.stripe.com/**");

  await page.getByText("Pay now").click();

  const checkoutSessionId = getCheckoutSessionId((await checkoutRequest).url());
  await page.waitForURL("https://checkout.stripe.com/**");

  return checkoutSessionId;
}

/**
 * Navigate to the Checkout Session's success_url or cancel_url
 */
export async function returnFromStripe({
  page,
  checkoutSessionId,
  outcome,
}: {
  page: Page;
  checkoutSessionId: string;
  outcome: "success" | "cancel";
}) {
  const { success_url, cancel_url } =
    await getStripeTestClient().checkout.sessions.retrieve(checkoutSessionId);
  const returnURL =
    outcome === "success"
      ? success_url?.replace("{CHECKOUT_SESSION_ID}", checkoutSessionId)
      : cancel_url;
  if (!returnURL) {
    throw Error(`No ${outcome} URL on Checkout Session ${checkoutSessionId}`);
  }

  await setStripeReferrer(page);
  await page.goto(returnURL);
}

export async function getCheckoutSessionStatus(
  checkoutSessionId: string,
): Promise<Stripe.Checkout.Session.Status | null> {
  const { status } =
    await getStripeTestClient().checkout.sessions.retrieve(checkoutSessionId);
  return status;
}

export async function navigateToPayComponent(
  page: Page,
  context: TestContext,
): Promise<string> {
  await page.goto(getPreviewURL(context));
  await fillInEmail({ page, context });
  await page.getByTestId("continue-button").click();
  await page.getByLabel("Pay test").fill("Test");
  await page.getByTestId("continue-button").click();
  return getSessionId(page);
}

export async function navigateToResumeURL({
  page,
  context,
  sessionId,
}: {
  page: Page;
  context: TestContext;
  sessionId: string;
}) {
  await page.goto(`${getPreviewURL(context)}&sessionId=${sessionId}`);
}

export async function resumeSessionViaMagicLink({
  page,
  context,
  sessionId,
}: {
  page: Page;
  context: TestContext;
  sessionId: string;
}) {
  await navigateToResumeURL({ page, context, sessionId });
  await page.locator("#email").fill(context.user.email);
  await page.getByTestId("continue-button").click();
}

/**
 * An applicant who returns mid-payment confirms their email and lands back on the Pay component,
 * on their original session, without reviewing their answers (reconciliation is skipped)
 */
export async function expectSessionResumedAtPay({
  page,
  context,
  sessionId,
}: {
  page: Page;
  context: TestContext;
  sessionId: string;
}) {
  await page.locator("#email").fill(context.user.email);
  const validateResponse = page.waitForResponse((response) =>
    response.url().includes("/validate-session"),
  );
  await page.getByTestId("continue-button").click();
  await validateResponse;

  await expect(page.getByText("Pay now")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Review your answers so far" }),
  ).toBeHidden();
  expect(await getSessionId(page)).toEqual(sessionId);
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

const getPreviewURL = (context: TestContext) =>
  `/${context.team.slug}/${context.flow!.slug}/published?analytics=false`;
