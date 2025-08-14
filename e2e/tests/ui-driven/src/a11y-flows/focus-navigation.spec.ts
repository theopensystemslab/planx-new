import { test, expect } from "@playwright/test";
import {
  contextDefaults,
  setUpTestContext,
  tearDownTestContext,
} from "../helpers/context.js";
import {
  fillInEmail,
  answerQuestion,
  clickContinue,
} from "../helpers/userActions.js";
import { simpleSendFlow } from "../mocks/flows/save-and-return-flows.js";
import { TestContext } from "../helpers/types.js";

test.describe("Focus navigation accessibility", () => {
  let context: TestContext = {
    ...contextDefaults,
    flow: {
      slug: "focus-navigation-test-flow",
      name: "Focus navigation test flow",
      data: simpleSendFlow,
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

  test("skip link works consistently across multiple form steps", async ({
    page,
  }) => {
    await fillInEmail({ page, context });
    await clickContinue({ page, waitForResponse: true });

    await answerQuestion({ page, title: "Question 1", answer: "A" });
    await clickContinue({ page, waitForLogEvent: true });

    await page.keyboard.press("Tab");

    const skipLink = page.getByText("Skip to main content");
    await expect(skipLink).toBeFocused();

    await skipLink.click();

    await answerQuestion({ page, title: "Question 2", answer: "One" });
    await clickContinue({ page, waitForLogEvent: true });

    await page.keyboard.press("Tab");

    const skipLinkAgain = page.getByText("Skip to main content");
    await expect(skipLinkAgain).toBeFocused();
  });
});
