import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

import { contextDefaults } from "./context.js";

export const navigateToService = async (page: Page, slug: string) => {
  await page.goto(`/app/${contextDefaults.team.slug}/${slug}`);

  await expect(page.getByRole("link", { name: slug })).toBeVisible();
};

export const navigateToFlowsPage = async (page: Page) => {
  await page.goto(`/app/${contextDefaults.team.slug}/flows`);

  await expect(page.getByText(contextDefaults.team.name).first()).toBeVisible();
  await expect(page.locator("h1", { hasText: "Flows" })).toBeVisible();
};

export const publishService = async (page: Page) => {
  // Open modal
  await page.getByTestId("check-for-changes-to-publish-button").click();

  // 3-step modal opens on Review step, click "next" to Test step
  await expect(page.getByRole("heading", { name: "Review" })).toBeVisible();
  await page.getByTestId("next-step-test-button").click();

  // Confirm changes have been tested, click "next" to Publish step
  await expect(page.getByRole("heading", { name: "Test" })).toBeVisible();
  await page.getByTestId("test-confirmation-checkbox").click();
  await page.getByTestId("next-step-publish-button").click();

  // Add a "summary" and publish
  await expect(page.getByRole("heading", { name: "Publish" })).toBeVisible();
  await page.getByTestId("publish-summary-input").fill("lorem ipsum");
  await page.getByTestId("publish-button").click();

  // Wait for confirmation of success
  await expect(
    page.getByText("Successfully published changes").first(),
  ).toBeVisible();
};

export const navigateToFlowSettings = async (page: Page) => {
  await page.locator('[aria-label="Flow settings"]').click();
};

export const makeFlowAService = async (page: Page) => {
  await page.getByText("Make this a user-facing service").click();
  await page.getByText("Set to service").click();

  await expect(page.getByText("Settings updated successfully")).toBeVisible();
};

export const turnServiceOnline = async (page: Page) => {
  await page.getByRole("tab", { name: "Visibility" }).click();
  await page.getByTestId("set-status-button").click();

  await expect(page.getByText("Settings updated successfully")).toBeVisible();
};
