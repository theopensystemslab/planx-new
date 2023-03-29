import { test, expect } from "@playwright/test";
import simpleSendFlow from "./flows/simple-send-flow.json";
import { GraphQLClient, gql } from "graphql-request";
import {
  simpleSendFlow,
  modifiedSimpleSendFlow,
} from "./flows/save-and-return-flows";
import {
  getGraphQLClient,
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
      await clickContinue({ page, waitForResponse: true });

      await answerQuestion({ page, title: "Question 1", answer: "A" });
      await clickContinue({ page });

      const sessionId = await saveSession({ page, adminGQLClient, context });
      if (!sessionId) test.fail();
      await returnToSession({ page, context, sessionId: sessionId! });

      const reviewTitle = await page.locator("h1", {
        hasText: "Resume your application",
      });
      await expect(reviewTitle).toBeVisible();
    });

    // TODO - fix failing test
    test.skip("the application resumes from the last unanswered question", async ({
      page,
    }) => {
      await page.goto(previewURL);
      await fillInEmail({ page, context });
      await clickContinue({ page, waitForResponse: true });

      await answerQuestion({ page, title: "Question 1", answer: "A" });
      await clickContinue({ page });

      let secondQuestion = await findQuestion({
        page,
        title: "Question 2",
      });
      await expect(secondQuestion).toBeVisible();

      const sessionId = await saveSession({ page, adminGQLClient, context });
      if (!sessionId) test.fail();

      await returnToSession({ page, context, sessionId: sessionId! });
      await clickContinue({ page });

      // skip review page
      await page.getByRole("button", { name: "Continue" }).click();

      secondQuestion = await findQuestion({
        page,
        title: "Question 2",
      });
      await expect(secondQuestion).toBeVisible();
    });
  });

  test.describe("session reconciliation", () => {
    test("the application resumes from the first modified question", async ({
      page,
    }) => {
      await page.goto(previewURL);
      await fillInEmail({ page, context });

      const firstQuestion = await findQuestionGroup({
        page,
        questionGroup: "Question 1",
      });
      await expect(firstQuestion).toBeVisible();
      await answerQuestion({ page, questionGroup: "Question 1", answer: "A" });

      const secondQuestion = await findQuestionGroup({
        page,
        questionGroup: "Question 2",
      });
      await expect(secondQuestion).toBeVisible();

      const sessionId = await saveSession({ page, adminGQLClient, context });
      if (!sessionId) test.fail();

      // flow is updated between sessions
      await modifyFlow(adminGQLClient, context);

      await returnToSession({ page, context, sessionId });

      // skip review page
      await page.getByRole("button", { name: "Continue" }).click();

      const modifiedFirstQuestion = await findQuestionGroup({
        page,
        questionGroup: "Question One",
      });
      await expect(modifiedFirstQuestion).toBeVisible();
    });

    // TODO "changes to a section are not displayed as changed during reconciliation"
  });
});

async function modifyFlow(adminGQLClient: GraphQLClient, context: Context) {
  await adminGQLClient.request(
    gql`
      mutation UpdateTestFlow($flowId: uuid!, $userId: Int!, $data: jsonb!) {
        update_flows_by_pk(pk_columns: { id: $flowId }, _set: { data: $data }) {
          id
          data
        }
        insert_published_flows_one(
          object: { flow_id: $flowId, data: $data, publisher_id: $userId }
        ) {
          id
        }
      }
    `,
    {
      flowId: context.flow.id,
      userId: context.user.id,
      data: modifiedSimpleSendFlow,
    }
  );
}
