import { test, expect } from "@playwright/test";
import { flow } from "./flows/sections-flow";
import { setUpTestContext, tearDownTestContext } from "./context";
import { fillInEmail } from "./helpers";
import type { Context } from "./context";

test.describe("Sections", () => {
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
      slug: "sections-test-flow",
      data: flow,
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

  test.describe("simple section states", () => {
    test("a simple set of section statuses are displayed", async ({ page }) => {
      await page.goto(previewURL);
      await page.evaluate('featureFlags.toggle("NAVIGATION_UI")');

      await fillInEmail({ page, context });

      const sections = await page.locator("dl > dt");
      const statuses = await page.locator("dl > dd");

      await expect(sections).toContainText([
        "Section One",
        "Section Two",
        "Section Three",
      ]);
      await expect(statuses).toContainText([
        "READY TO CONTINUE",
        "CANNOT CONTINUE YET",
        "CANNOT CONTINUE YET",
      ]);
    });
  });
});
