import { expect, Page } from "@playwright/test";
import { contextDefaults } from "./context.js";

export const navigateToService = async (page: Page, slug: string) => {
  await page.goto(`/${contextDefaults.team.slug}/${slug}`);

  await expect(page.getByRole("link", { name: slug })).toBeVisible();
};

export const publishService = async (page: Page) => {
  // Open modal
  page.getByTestId("check-for-changes-to-publish-button").click();

  // 3-step modal opens on Review step, click "next" to Test step
  await expect(page.getByRole("heading", { name: "Review" })).toBeVisible();
  page.getByTestId("next-step-test-button").click();

  // Confirm changes have been tested, click "next" to Publish step
  await expect(page.getByRole("heading", { name: "Test" })).toBeVisible();
  page
    .getByTestId("test-confirmation-checkbox")
    .selectOption({ label: "Yes, these changes have been tested" });
  page.getByTestId("next-step-publish-button").click();

  // Add a "summary" and publish
  await expect(page.getByRole("heading", { name: "Publish" })).toBeVisible();
  page.getByTestId("publish-summary-input").fill("lorem ipsum");
  page.getByTestId("publish-button").click();
};

export const turnServiceOnline = async (page: Page) => {
  page.locator('[aria-label="Service settings"]').click();
  page.getByLabel("Offline").click();

  page.getByRole("button", { name: "Save", disabled: false }).click();
  await expect(
    page.getByText("Service settings updated successfully"),
  ).toBeVisible();
};
