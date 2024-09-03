import { Browser, expect, test } from "@playwright/test";
import type { Context } from "../context";
import {
  contextDefaults,
  setUpTestContext,
  tearDownTestContext,
} from "../context";
import {
  answerQuestion,
  clickContinue,
  createAuthenticatedSession,
} from "../globalHelpers";
import {
  createNotice,
  createQuestionWithOptions,
  getTeamPage,
  isGetUserRequest,
} from "./helpers";

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

    const team = page.locator("h3", { hasText: context.team.name });

    let isRepeatedRequestMade = false;
    page.on(
      "request",
      (req) => (isRepeatedRequestMade = isGetUserRequest(req))
    );

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
    const team = page.locator("h3", { hasText: context.team.name });
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

    const questionText = "Is this a test?";
    await createQuestionWithOptions(page, "li.hanger > a", questionText, [
      "Yes",
      "No",
    ]);
    await expect(
      page.locator("a").filter({ hasText: questionText })
    ).toBeVisible();

    // Add a notice to the "Yes" path
    const yesBranch = page.locator("#flow .card .options .option").nth(0);

    const yesBranchNoticeText = "Yes! this is a test";
    await createNotice(
      page,
      yesBranch.locator(".hanger > a"),
      yesBranchNoticeText
    );

    // Add a notice to the "No" path
    const noBranch = page.locator("#flow .card .options .option").nth(1);
    const noBranchNoticeText = "Sorry, this is a test";
    await createNotice(
      page,
      noBranch.locator(".hanger > a"),
      noBranchNoticeText
    );

    const nodes = page.locator(".card");
    await expect(nodes.getByText(questionText)).toBeVisible();
    await expect(nodes.getByText(yesBranchNoticeText)).toBeVisible();
    await expect(nodes.getByText(noBranchNoticeText)).toBeVisible();
  });

  test("Cannot preview an unpublished flow", async ({
    browser,
  }: {
    browser: Browser;
  }) => {
    const page = await createAuthenticatedSession({
      browser,
      userId: context.user!.id!,
    });

    await page.goto(
      `/${context.team.slug}/${serviceProps.slug}/published?analytics=false`
    );

    await expect(page.getByText("Not Found")).toBeVisible();
  });

  test("Publish a flow", async ({ browser }) => {
    const page = await createAuthenticatedSession({
      browser,
      userId: context.user!.id!,
    });

    await page.goto(`/${context.team.slug}/${serviceProps.slug}`);

    page.getByRole("button", { name: "CHECK FOR CHANGES TO PUBLISH" }).click();
    page.getByRole("button", { name: "PUBLISH", exact: true }).click();

    const previewLink = page.getByRole("link", {
      name: "Open published service",
    });
    await expect(previewLink).toBeVisible();
  });

  test("Cannot preview an offline flow", async ({
    browser,
  }: {
    browser: Browser;
  }) => {
    const page = await createAuthenticatedSession({
      browser,
      userId: context.user!.id!,
    });

    await page.goto(
      `/${context.team.slug}/${serviceProps.slug}/published?analytics=false`
    );

    await expect(
      page.getByRole("heading", { level: 1, name: "Offline" })
    ).toBeVisible();
  });

  test("Turn a flow online", async ({ browser }) => {
    const page = await createAuthenticatedSession({
      browser,
      userId: context.user!.id!,
    });

    await page.goto(`/${context.team.slug}/${serviceProps.slug}`);

    // Open flow settings
    page.locator('[aria-label="Service settings"]').click();

    // Toggle flow online
    page.getByLabel("Offline").click();
    page.getByRole("button", { name: "Save", disabled: false }).click();
    await expect(
      page.getByText("Service settings updated successfully")
    ).toBeVisible();

    // Exit back to main Editor page
    page.locator('[aria-label="Editor"]').click();

    const previewLink = page.getByRole("link", {
      name: "Open published service",
    });
    await expect(previewLink).toBeVisible();
  });

  test("Can preview a published flow", async ({
    browser,
  }: {
    browser: Browser;
  }) => {
    const page = await createAuthenticatedSession({
      browser,
      userId: context.user!.id!,
    });

    await page.goto(
      `/${context.team.slug}/${serviceProps.slug}/published?analytics=false`
    );

    await answerQuestion({ page, title: "Is this a test?", answer: "Yes" });
    await clickContinue({ page });
    await expect(
      page.locator("h1", { hasText: "Yes! this is a test" })
    ).toBeVisible();

    await page.getByTestId("backButton").click();

    await answerQuestion({ page, title: "Is this a test?", answer: "No" });
    await clickContinue({ page });
    await expect(
      page.locator("h1", { hasText: "Sorry, this is a test" })
    ).toBeVisible();
  });
});
