import { expect, test } from "@playwright/test";

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

test.describe("Stripe integration @regression", () => {
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

  test("a successful payment", async ({ page }) => {
    const sessionId = await navigateToPayComponent(page, context);
    context.sessionIds!.push(sessionId);

    const { paymentIntent } = await payViaStripe(page);
    expect(paymentIntent.status).toEqual("succeeded");

    await expect(page.getByText("Form sent")).toBeVisible();

    await expect
      .poll(async () => {
        const session = await findSession({ adminGQLClient, sessionId });
        return session?.data?.breadcrumbs?.[payNodeId]?.data?.[
          "application.fee.reference"
        ];
      })
      .toEqual(paymentIntent.id);
  });
});
