import assert from "node:assert";
import { test, expect, Locator } from "@playwright/test";
import Client from "planx-client";
import simpleSendFlow from "./simple-send-flow.json";
import {
  InitialContext,
  findSessionId,
  setUpTestContext,
  tearDownTestContext,
} from "./context";

test.describe("Save and return", () => {
  const client = getClient();
  let context: any = getInitialContext();
  let previewURL;

  test.beforeAll(async () => {
    try {
      context = await setUpTestContext(client, context);
    } catch (error) {
      await tearDownTestContext(client, context);
      throw error;
    }
    previewURL = `/${context.team.slug}/${context.flow.slug}/preview?analytics=false`;
  });

  test.afterAll(async () => {
    await tearDownTestContext(client, context);
  });

  test.describe("email", () => {
    test("email confirmation is required", async ({ page }) => {
      await page.goto(previewURL);
      await page.locator("#email").fill(context.user.email);
      await page.getByTestId("continue-button").click();
      const errorMessage = page.getByTestId("error-message-confirmEmail");
      await expect(errorMessage).toHaveText("Email address required");
    });

    test("email confirmation must match", async ({ page }) => {
      await page.goto(previewURL);
      await page.locator("#email").fill(context.user.email);
      await page.locator("#confirmEmail").fill("notthesame@email.com");
      await page.getByTestId("continue-button").click();
      const errorMessage = page.getByTestId("error-message-confirmEmail");
      await expect(errorMessage).toHaveText("Emails must match");
    });
  });

  test.describe("resuming a saved applciation", () => {
    test("the application presents a review screen on return", async ({
      page,
    }) => {
      await page.goto(previewURL);
      await fillInEmail({ page, context });
      await answerQuestion({ page, questionGroup: "Question 1", answer: "A" });

      const sessionId = await saveSession({ page, client, context });
      await returnToSession({ page, context, sessionId });

      const reviewTitle = await page.locator("h1", { name: "Review" });
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

      const sessionId = await saveSession({ page, client, context });
      await returnToSession({ page, context, sessionId });

      // skip review page
      await page.getByRole("button", { name: "Continue" }).click();

      await expect(secondQuestion).toBeVisible();
    });
  });
});

async function returnToSession({ page, context, sessionId }) {
  const returnURL = `/${context.team.slug}/${context.flow.slug}/preview?analytics=false&sessionId=${sessionId}`;
  await page.goto(returnURL);
  await page.locator("#email").fill(context.user.email);
  await page.getByTestId("continue-button").click();
}

async function saveSession({ page, client, context }): string {
  const text = "Save and return to this application later";
  await page.locator(`button :has-text("${text}")`).click();
  await page.waitForResponse((resp) => resp.url().includes("save"));
  const sessionId = await findSessionId(client, context);
  test.fail(!sessionId, "sessionId not found");
  return sessionId;
}

async function fillInEmail({ page, context }) {
  await page.locator("#email").fill(context.user.email);
  await page.locator("#confirmEmail").fill(context.user.email);
  await page.getByTestId("continue-button").click();
}

async function findQuestionGroup({ page, questionGroup }): Locator {
  return await page.getByRole("group", {
    name: questionGroup,
  });
}

async function answerQuestion({ page, questionGroup, answer }) {
  const group = await findQuestionGroup({ page, questionGroup });
  await group.getByRole("button", { name: answer }).click();
  await page.getByTestId("continue-button").click();
  await page.waitForResponse(
    (response) =>
      response.url().includes("graphql") && response.status() === 200
  );
}

function getInitialContext() {
  const context: InitialContext = {
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
      slug: "e2e-save-and-return-test-flow1",
      data: simpleSendFlow,
    },
  };
  return context;
}

function getClient(): Client {
  // check env
  assert(process.env.HASURA_GRAPHQL_URL);
  assert(process.env.HASURA_GRAPHQL_ADMIN_SECRET);

  const API = process.env.HASURA_GRAPHQL_URL!.replace(
    "${HASURA_PROXY_PORT}",
    process.env.HASURA_PROXY_PORT
  );
  const SECRET = process.env.HASURA_GRAPHQL_ADMIN_SECRET!;
  return new Client({
    hasuraSecret: SECRET,
    targetURL: API,
  });
}
