import { test, expect } from "@playwright/test";
import simpleSendFlow from "./flows/simple-send-flow.json";
import {
  getGraphQLClient,
  setUpTestContext,
  tearDownTestContext,
} from "./context";
import {
  fillInEmail,
  findQuestionGroup,
  answerQuestion,
  returnToSession,
  saveSession,
} from "./helpers";
import type { Context } from "./context";

test.describe("Save and return", () => {
  const adminGQLClient = getGraphQLClient();
  let context: Context = {
    user: {
      firstName: "test",
      lastName: "test",
      email: "e2etest@test.com",
    },
    team: {
      name: "E2E Test Team",
      slug: "e2e-test-team",
      logo: "https://placedog.net/250/250",
      primaryColor: "#F30415",
      homepage: "example.com",
    },
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
      await answerQuestion({ page, questionGroup: "Question 1", answer: "A" });

      const sessionId = await saveSession({ page, adminGQLClient, context });
      if (!sessionId) test.fail();
      await returnToSession({ page, context, sessionId: sessionId! });

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
      await answerQuestion({ page, questionGroup: "Question 1", answer: "A" });

      const secondQuestion = await findQuestionGroup({
        page,
        questionGroup: "Question 2",
      });
      await expect(secondQuestion).toBeVisible();

      const sessionId = await saveSession({ page, adminGQLClient, context });
      if (!sessionId) test.fail();
      await returnToSession({ page, context, sessionId: sessionId! });

      // skip review page
      await page.getByRole("button", { name: "Continue" }).click();

      await expect(secondQuestion).toBeVisible();
    });
  });
});
