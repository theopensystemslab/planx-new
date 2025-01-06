import { expect, Page } from "@playwright/test";
import { contextDefaults } from "./context.js";

export const navigateToService = async (page: Page, slug: string) => {
  await page.goto(`/${contextDefaults.team.slug}/${slug}`);

  await expect(page.getByRole("link", { name: slug })).toBeVisible();
};

export const publishService = async (page: Page) => {
  page.getByRole("button", { name: "CHECK FOR CHANGES TO PUBLISH" }).click();
  await expect(
    page.getByRole("heading", { name: "Check for changes to publish" }),
  ).toBeVisible();
  page.getByRole("button", { name: "PUBLISH", exact: true }).click();
};

export const turnServiceOnline = async (page: Page) => {
  page.locator('[aria-label="Service settings"]').click();
  page.getByLabel("Offline").click();

  page.getByRole("button", { name: "Save", disabled: false }).click();
  await expect(
    page.getByText("Service settings updated successfully"),
  ).toBeVisible();
};
