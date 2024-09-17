import { expect, test } from "@playwright/test";
import type { Context } from "./helpers/context";
import {
  contextDefaults,
  setUpTestContext,
  tearDownTestContext,
} from "./helpers/context";
import {
  createAuthenticatedSession,
  isGetUserRequest,
} from "./helpers/globalHelpers";

test.describe("Refresh page", () => {
  let context: Context = {
    ...contextDefaults,
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
});
