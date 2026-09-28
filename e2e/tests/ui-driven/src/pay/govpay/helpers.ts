import type { Page } from "@playwright/test";

import { TEST_EMAIL } from "../../helpers/globalHelpers.js";

// Test card numbers to be used in gov.uk sandbox environment
// reference: https://docs.payments.service.gov.uk/testing_govuk_pay/#if-you-39-re-using-a-test-39-sandbox-39-account
export const cards = {
  successful_card_number: "4444333322221111",
  invalid_card_number: "4000000000000002",
};

export async function fillGovUkCardDetails({
  page,
  cardNumber,
}: {
  page: Page;
  cardNumber: string;
}) {
  await page.locator("#card-no").fill(cardNumber);
  await page.getByLabel("Month").fill("12");
  await page.getByLabel("Year").fill("2099");
  await page.getByLabel("Name on card").fill("Test t Test");
  await page.getByLabel("Card security code", { exact: false }).fill("123");

  await page.locator("#address-line-1").fill("Test");
  await page.locator("#address-line-2").fill("123");

  await page.getByLabel("Town or city").fill("Test");
  await page.getByLabel("Postcode").fill("HP111BB");
  await page.getByLabel("Email").fill(TEST_EMAIL);
  await page.locator("button#submit-card-details").click();
}

export async function submitCardDetails(page: Page) {
  await page.locator("#confirm").click();
}
