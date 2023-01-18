import { test, expect } from "@playwright/test";
import type { Page, Browser } from "@playwright/test";
import {
  generateAuthenticationToken,
  getClient,
  setUpTestContext,
  tearDownTestContext,
} from "./context";

test.describe("Retry requests with network error", () => {
  const client = getClient();
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
      context = await setUpTestContext(client, context);
    } catch (error) {
      await tearDownTestContext(client, context);
      throw error;
    }
  });

  test.afterAll(async () => {
    await tearDownTestContext(client, context);
  });

  test.describe("Shows error toast when there is a network error and removes it when a retry is successful", () => {
    test("team login", async ({ browser }) => {
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

    test("network interuption", async ({ browser }) => {
      const page = await createAuthenticatedSession({
        browser,
        userId: context.user.id,
      });
      await page.goto("/");

      const team = page.locator("h2").filter({ hasText: context.team.name });
      await team.waitFor();

      // drop graphql requests
      await page.route("**/graphql", (route) => {
        route.abort("connectionfailed");
      });
      await team.click();
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
});

async function createAuthenticatedSession({
  browser,
  userId,
}: {
  browser: Browser;
  userId: number;
}): Page {
  const browserContext = await browser.newContext();
  const page = await browserContext.newPage();
  const token = generateAuthenticationToken(`${userId}`);
  await browserContext.addCookies([
    {
      name: "jwt",
      domain: "localhost",
      path: "/",
      value: token,
    },
  ]);
  return page;
}
