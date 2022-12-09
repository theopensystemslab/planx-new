import assert from "node:assert";
import { test, expect } from "@playwright/test";
import Client from "planx-client";
import simpleSendFlow from "./simple-send-flow.json";
import {
  InitialContext,
  findSessionId,
  setUpTestContext,
  tearDownTestContext,
} from "./context";

assert(process.env.EDITOR_URL_EXT);
assert(process.env.HASURA_GRAPHQL_URL);
assert(process.env.HASURA_GRAPHQL_ADMIN_SECRET);
const URL = process.env.EDITOR_URL_EXT!;
const API = process.env.HASURA_GRAPHQL_URL!;
const SECRET = process.env.HASURA_GRAPHQL_ADMIN_SECRET!;

test.describe("Save and return", () => {
  const client = new Client({
    hasuraSecret: SECRET,
    targetURL: API,
  });
  let context: any = getInitialContext();
  const urls: any = {};

  test.beforeAll(async () => {
    try {
      context = await setUpTestContext(client, context);
    } catch (error) {
      await tearDownTestContext(client, context);
      throw error;
    }
    urls.preview = `${URL}/${context.team.slug}/${context.flow.slug}/preview?analytics=false`;
  });

  test.afterAll(async () => {
    await tearDownTestContext(client, context);
  });

  test.describe("email", () => {
    test("email confirmation is required", async ({ page }) => {
      await page.goto(urls.preview);
      await page.locator("#email").fill(context.user.email);
      await page.getByTestId("continue-button").click();
      const errorMessage = page.getByTestId("error-message-confirmEmail");
      await expect(errorMessage).toHaveText("Email address required");
    });

    test("email confirmation must match", async ({ page }) => {
      await page.goto(urls.preview);
      await page.locator("#email").fill(context.user.email);
      await page.locator("#confirmEmail").fill("notthesame@email.com");
      await page.getByTestId("continue-button").click();
      const errorMessage = page.getByTestId("error-message-confirmEmail");
      await expect(errorMessage).toHaveText("Emails must match");
    });
  });

  test.describe("resuming a saved applciation", () => {
    test("the application resumes from the last unanswered question", async ({
      page,
    }) => {
      // Email
      await page.goto(urls.preview);
      await page.locator("#email").fill(context.user.email);
      await page.locator("#confirmEmail").fill(context.user.email);
      await page.getByTestId("continue-button").click();

      // Question 1
      const questionGroup = await page.getByRole("group", {
        name: "Question 1",
      });
      await questionGroup.getByRole("button", { name: "A" }).click();
      await questionGroup.getByRole("button", { name: "B" }).click();
      await page.getByTestId("continue-button").click();

      // Save
      await page
        .locator(
          `button :has-text("Save and return to this application later")`
        )
        .click();

      // Find session
      const sessionId = await findSessionId(client, context);
      test.fail(!sessionId, "sessionId not found");
      urls.return = `${URL}/${context.team.slug}/${context.flow.slug}/preview?analytics=false&sessionId=${sessionId}`;

      // Return
      await page.goto(urls.return);
      await page.locator("#email").fill(context.user.email);
      await page.getByTestId("continue-button").click();

      // Review
      await page.getByRole("button", { name: "Continue" }).click();

      // Question 2
      const nextQuestionGroup = await page.getByRole("group", {
        name: "Question 2",
      });
      await expect(nextQuestionGroup).toBeVisible();
    });
  });
});

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
