import { test, expect } from "@playwright/test";
import { getClient, setUpTestContext, tearDownTestContext } from "./context";

test.describe("Retry requests with network error", () => {
  const client = getClient();
  let context: any = {
    user: {
      firstName: "test",
      lastName: "test",
      email: "e2etest@test.com",
    },
    team: {
      name: "BadInternet",
      slug: "bad-internet-test-team",
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
    test("team login", async ({ page }) => {
      await page.goto("/");

      //// set JWT ...
      //await page.locator("a", { hasText: "Login with Google" }).click();

      //const team = await page.locator("h2", { hasText: context.team.name });
      //await expect(team).toBeVisible();
      await expect(
        page.locator("a", { hasText: "Login with Google" })
      ).toBeVisible();
    });

    test.skip("network interuption", async ({ page }) => {
      await page.route("/auth/google", (route) => {
        route.abort("internetdisconnected");
      });
      const team = await page.locator("h2", { hasText: context.team.name });
      await team.click();
      const toastText = "Network error, attempting to reconnect…";
      await expect(page.locator("div", { hasText: toastText })).toBeVisible();
    });

    test.skip("network reconnection", async ({ page }) => {
      await page.route("/auth/google", (route) => {
        route.continue();
      });
      const team = await page.locator("h2", { hasText: context.team.name });
      await team.click();
      await expect(
        page.locator("h1", { hasText: "My services" })
      ).toBeVisible();
      const toastText = "Network error, attempting to reconnect…";
      await expect(
        page.locator("div", { hasText: toastText })
      ).not.toBeVisible();
    });
  });
});
