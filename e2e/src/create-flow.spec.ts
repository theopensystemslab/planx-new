import { test, expect } from "@playwright/test";
import { setUpTestContext, tearDownTestContext } from "./context";
import { getTeamPage, createAuthenticatedSession } from "./helpers";

test.describe("Navigation", () => {
  let context: any = {
    user: {
      firstName: "test",
      lastName: "test",
      email: "e2etest@test.com",
    },
    team: {
      name: "E2E Navigation Test",
      slug: "e2e-navigation-test",
      logo: "https://placedog.net/250/250",
      primaryColor: "#000000",
      homepage: "example.com",
    },
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

  test("Create a flow", async ({ browser }) => {
    const page = await getTeamPage({
      browser,
      userId: context.user.id,
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
      page.locator("a").filter({ hasText: questionText })
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

  test("Preview a created flow", async ({ browser }) => {
    const page = await createAuthenticatedSession({
      browser,
      userId: context.user.id,
    });
    await page.goto(
      `/${context.team.slug}/${serviceProps.slug}/preview?analytics=false`
    );

    await page.locator("form").getByText("Yes").click();
    await page.locator("button").filter({ hasText: "Continue" }).click();
    await expect(page.locator("h3", "Yes! this is a test")).toBeVisible();

    await page
      .locator("#main-content")
      .getByRole("button", { name: "Back" })
      .click();

    await page.locator("form").getByText("No").click();
    await page.locator("button").filter({ hasText: "Continue" }).click();
    await expect(page.locator("h3", "Sorry this is a test")).toBeVisible();
  });
});
