import { test, expect } from "@playwright/test";
import { createAuthenticatedSession } from "./helpers";
import { setUpTestContext, tearDownTestContext } from "./context";

test.describe("Login", () => {
  let context: any = {
    user: {
      firstName: "test",
      lastName: "test",
      email: "e2etest@test.com",
    },
    team: {
      name: "BadInternetClub",
      logo: "https://placedog.net/250/250",
      primaryColor: "#000000",
      homepage: "example.com",
    },
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

  test("setting a cookie bypasses login", async ({ browser }) => {
    const page = await createAuthenticatedSession({
      browser,
      userId: context.user.id,
    });

    await page.goto("/");
    await page.waitForResponse((response) => {
      return response.url().includes("/graphql");
    });

    const team = await page.locator("h2", { hasText: context.team.name });
    await expect(team).toBeVisible();
  });

  test("shows error toast when there is a network error and removes it when a retry is successful", async ({
    browser,
  }) => {
    const page = await createAuthenticatedSession({
      browser,
      userId: context.user.id,
    });
    await page.goto("/");

    const teamLink = page.locator("h2").filter({ hasText: context.team.name });
    await teamLink.waitFor(); // wait for this to be visible

    // drop graphql requests
    await page.route("**/graphql", (route) => {
      route.abort("connectionfailed");
    });

    await teamLink.click();
    const toastText = "Network error, attempting to reconnect…";
    await expect(page.getByText(toastText)).toBeVisible();

    // resume graphql requests
    await page.route("**/graphql", (route) => {
      route.continue();
    });
    await expect(
      page.locator("h1").filter({ hasText: "My services" })
    ).toBeVisible();
    await expect(page.getByText(toastText)).not.toBeVisible();
  });
});
