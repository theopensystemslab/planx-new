import { test, expect, Browser } from "@playwright/test";
import {
  contextDefaults,
  setUpTestContext,
  tearDownTestContext,
} from "../context";
import {
  createAuthenticatedSession,
  answerQuestion,
  clickContinue,
} from "../globalHelpers";
import type { Context } from "../context";
import { getTeamPage, isGetUserRequest } from "./helpers";

test.describe("Navigation", () => {
  let context: Context = {
    ...contextDefaults,
  };
  const serviceProps = {
    name: "A Test Service",
    slug: "a-test-service",
  };

  test.beforeAll(async () => {
    try {
      context = await setUpTestContext(context);
    } catch (error) {
      // ensure proper teardown if setup fails
      await tearDownTestContext(context);
      throw error;
    }
  });

  test.afterAll(async () => {
    await tearDownTestContext(context);
  });

  test("user data persists on page refresh @regression", async ({
    browser,
  }) => {
    const page = await createAuthenticatedSession({
      browser,
      userId: context.user!.id!,
    });

    const initialRequest = page.waitForRequest(isGetUserRequest);

    Promise.all([await page.goto("/"), await initialRequest]);

    const team = page.locator("h2", { hasText: context.team.name });

    let isRepeatedRequestMade = false;
    page.on("request", (req) => (isRepeatedRequestMade = isGetUserRequest(req)));

    Promise.all([
      await team.click(),
      expect(isRepeatedRequestMade).toBe(false),
    ]);

    const reloadRequest = page.waitForRequest(isGetUserRequest);

    Promise.all([await page.reload(), await reloadRequest]);
  });

  test("team data persists on page refresh @regression", async ({
    browser,
  }) => {
    const page = await createAuthenticatedSession({
      browser,
      userId: context.user!.id!,
    });

    await page.goto("/");
    const team = page.locator("h2", { hasText: context.team.name });
    await team.click();

    const teamSlugInHeader = page.getByRole("link", {
      name: context.team.slug,
    });
    await expect(teamSlugInHeader).toBeVisible();

    await page.reload();
    await expect(teamSlugInHeader).toBeVisible();

    await page.goBack();
    await expect(teamSlugInHeader).toBeHidden();
  });

  test("Create a flow", async ({ browser }) => {
    const page = await getTeamPage({
      browser,
      userId: context.user!.id!,
      teamName: context.team.name,
    });

    page.on("dialog", (dialog) => dialog.accept(serviceProps.name));
    await page.locator("button", { hasText: "Add a new service" }).click();

    // update context to allow flow to be torn down
    context.flow = { ...serviceProps };

    await page.locator("li.hanger > a").click();
    await page.getByRole("dialog").waitFor();

    const questionText = "Is this a test?";
    await page.getByPlaceholder("Text").fill(questionText);

    await page.locator("button").filter({ hasText: "add new" }).click();
    await page.getByPlaceholder("Option").fill("Yes");

    await page.locator("button").filter({ hasText: "add new" }).click();
    await page.getByPlaceholder("Option").nth(1).fill("No");

    await page.locator("button").filter({ hasText: "Create question" }).click();
    await expect(
      page.locator("a").filter({ hasText: questionText }),
    ).toBeVisible();

    // Add a notice to the "Yes" path
    const yesBranch = page.locator("#flow .card .options .option").nth(0);
    await yesBranch.locator(".hanger > a").click();
    await page.getByRole("dialog").waitFor();

    await page.locator("select").selectOption({ label: "Notice" });
    const yesBranchNoticeText = "Yes! this is a test";
    await page.getByPlaceholder("Notice").fill(yesBranchNoticeText);
    await page.locator("button").filter({ hasText: "Create notice" }).click();

    // Add a notice to the "No" path
    const noBranch = page.locator("#flow .card .options .option").nth(1);
    await noBranch.locator(".hanger > a").click();
    await page.getByRole("dialog").waitFor();

    await page.locator("select").selectOption({ label: "Notice" });
    const noBranchNoticeText = "Sorry, this is a test";
    await page.getByPlaceholder("Notice").fill(noBranchNoticeText);
    await page.locator("button").filter({ hasText: "Create notice" }).click();

    const nodes = page.locator(".card");
    await expect(nodes.getByText(questionText)).toBeVisible();
    await expect(nodes.getByText(yesBranchNoticeText)).toBeVisible();
    await expect(nodes.getByText(noBranchNoticeText)).toBeVisible();
  });

  test("Preview a created flow", async ({ browser }: { browser: Browser }) => {
    const page = await createAuthenticatedSession({
      browser,
      userId: context.user!.id!,
    });

    await page.goto(
      `/${context.team.slug}/${serviceProps.slug}/preview?analytics=false`,
    );

    await answerQuestion({ page, title: "Is this a test?", answer: "Yes" });
    await clickContinue({ page });
    await expect(
      page.locator("h3", { hasText: "Yes! this is a test" }),
    ).toBeVisible();

    await page
      .locator("#main-content")
      .getByRole("button", { name: "Back" })
      .click();

    await answerQuestion({ page, title: "Is this a test?", answer: "No" });
    await clickContinue({ page });
    await expect(
      page.locator("h3", { hasText: "Sorry, this is a test" }),
    ).toBeVisible();
  });
});
