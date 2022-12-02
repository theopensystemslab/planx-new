import { test, expect } from "@playwright/test";

const testURL = "http://localhost:3000";

test.describe("Save and return", () => {
  test.beforeAll(async () => {
    // setup db state
    await Promise.resolve(); //tmp
  });

  test.afterAll(async () => {
    // tear down db state
    await Promise.resolve(); //tmp
  });

  test("...", async ({
    page,
  }) => {

    await page.goto(
      `${testURL}/opensystemslab/`
    );

    expect(await page.getByText("Application sent").textContent()).toBeTruthy();

  });
});
