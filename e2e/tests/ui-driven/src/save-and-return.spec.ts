import { test, expect } from "@playwright/test";
import {
  simpleSendFlow,
  modifiedSimpleSendFlow,
} from "./mocks/flows/save-and-return-flows";
import {
  contextDefaults,
  setUpTestContext,
  tearDownTestContext,
} from "./context";
import {
  fillInEmail,
  clickContinue,
  findQuestion,
  answerQuestion,
  returnToSession,
  saveSession,
  modifyFlow,
} from "./globalHelpers";
import type { Context } from "./context";

test.describe("Save and return", () => {
  let context: Context = {
    ...contextDefaults,
    flow: {
      slug: "e2e-save-and-return-test-flow",
      data: simpleSendFlow,
    },
  };
  const previewURL = `/${context.team?.slug}/${context.flow?.slug}/preview?analytics=false`;

  test.beforeAll(async () => {
    try {
      context = await setUpTestContext(context);
    } catch (e) {
      await tearDownTestContext(context);
      throw e;
    }
  });

  test.afterAll(async () => {
    await tearDownTestContext(context);
  });

  test.describe("email", () => {
    test("email confirmation is required", async ({ page }) => {
      await page.goto(previewURL);
      await page.locator("#email").fill(context.user?.email);
      await page.getByTestId("continue-button").click();
      const errorMessage = page.getByTestId("error-message-confirmEmail");
      await expect(errorMessage).toHaveText("Email address required");
    });

    test("email confirmation must match", async ({ page }) => {
      await page.goto(previewURL);
      await page.locator("#email").fill(context.user?.email);
      await page.locator("#confirmEmail").fill("notthesame@email.com");
      await page.getByTestId("continue-button").click();
      const errorMessage = page.getByTestId("error-message-confirmEmail");
      await expect(errorMessage).toHaveText("Emails must match");
    });
  });

  test.describe("resuming a saved application", () => {
    test("the application presents a review screen on return", async ({
      page,
    }) => {
      await page.goto(previewURL);
      await fillInEmail({ page, context });
      await clickContinue({ page, waitForResponse: true });

      await answerQuestion({ page, title: "Question 1", answer: "A" });
      await clickContinue({ page, waitForLogEvent: true });

      const sessionId = await saveSession({ page, context });
      expect(sessionId).toBeDefined();

      await returnToSession({
        page,
        context,
        sessionId: sessionId!,
        shouldContinue: false,
      });

      const reviewTitle = await page.locator("h1", {
        hasText: "Resume your application",
      });
      await expect(reviewTitle).toBeVisible();
    });

    test("the application resumes from the last unanswered question", async ({
      page,
    }) => {
      await page.goto(previewURL);
      await fillInEmail({ page, context });
      await clickContinue({ page, waitForResponse: true });

      await answerQuestion({ page, title: "Question 1", answer: "A" });
      await clickContinue({ page, waitForLogEvent: true });

      let secondQuestion = await findQuestion({ page, title: "Question 2" });
      await expect(secondQuestion).toBeVisible();

      const sessionId = await saveSession({ page, context });
      expect(sessionId).toBeDefined();

      await returnToSession({ page, context, sessionId: sessionId! });

      // skip review page
      await clickContinue({ page });

      secondQuestion = await findQuestion({ page, title: "Question 2" });
      await expect(secondQuestion).toBeVisible();
    });
  });

  test.describe("session reconciliation", () => {
    test("the application resumes with no modifications", async ({ page }) => {
      await page.goto(previewURL);
      await fillInEmail({ page, context });
      await clickContinue({ page, waitForResponse: true });

      await answerQuestion({ page, title: "Question 1", answer: "A" });
      await clickContinue({ page, waitForLogEvent: true });

      let secondQuestion = await findQuestion({ page, title: "Question 2" });
      await expect(secondQuestion).toBeVisible();

      const sessionId = await saveSession({ page, context });
      expect(sessionId).toBeDefined();

      await returnToSession({ page, context, sessionId: sessionId! });

      // skip review page
      await clickContinue({ page });

      secondQuestion = await findQuestion({ page, title: "Question 2" });
      await expect(secondQuestion).toBeVisible();
    });

    test("the application resumes from the first modified question", async ({
      page,
    }) => {
      await page.goto(previewURL);
      await fillInEmail({ page, context });
      await clickContinue({ page, waitForResponse: true });

      await answerQuestion({ page, title: "Question 1", answer: "A" });
      await clickContinue({ page, waitForLogEvent: true });

      const secondQuestion = await findQuestion({ page, title: "Question 2" });
      await expect(secondQuestion).toBeVisible();

      const sessionId = await saveSession({ page, context });
      expect(sessionId).toBeDefined();

      // flow is updated between sessions
      await modifyFlow({ context, modifiedFlow: modifiedSimpleSendFlow });

      await returnToSession({ page, context, sessionId: sessionId! });

      // skip review page
      await clickContinue({ page });

      const modifiedFirstQuestion = await findQuestion({
        page,
        title: "Question One",
      });
      await expect(modifiedFirstQuestion).toBeVisible();
    });
  });
});
