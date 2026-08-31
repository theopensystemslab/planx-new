import { expect, test } from "@playwright/test";

import {
  contextDefaults,
  setUpTestContext,
  tearDownTestContext,
} from "../helpers/context.js";
import type { TestContext } from "../helpers/types.js";
import {
  answerQuestion,
  clickContinue,
  fillInEmail,
} from "../helpers/userActions.js";
import { simpleSendFlow } from "../mocks/flows/save-and-return-flows.js";

test.describe("Focus navigation accessibility", () => {
  let context: TestContext = {
    ...contextDefaults,
    flow: {
      slug: "focus-navigation-test-flow",
      name: "Focus navigation test flow",
      data: simpleSendFlow,
      hasSendComponent: true,
    },
  };

  test.beforeAll(async () => {
    try {
      context = await setUpTestContext(context);
    } catch (e) {
      await tearDownTestContext();
      throw e;
    }
  });

  test.beforeEach(async ({ page }) => {
    const previewURL = `/${context.team?.slug}/${context.flow?.slug}/published?analytics=false`;
    await page.goto(previewURL);
  });

  test.afterAll(async () => {
    await tearDownTestContext();
  });

  test("focus moves to main content consistently across multiple form steps", async ({
    page,
  }) => {
    const mainContent = page.locator("#main-content");

    await fillInEmail({ page, context });
    await clickContinue({ page, waitForResponse: true });

    await answerQuestion({ page, title: "Question 1", answer: "A" });
    await clickContinue({ page, waitForLogEvent: true });

    await expect(mainContent).toBeFocused();

    await answerQuestion({ page, title: "Question 2", answer: "One" });
    await clickContinue({ page, waitForLogEvent: true });

    await expect(mainContent).toBeFocused();
  });
});
