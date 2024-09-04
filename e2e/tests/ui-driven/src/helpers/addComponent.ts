import { Locator, Page } from "@playwright/test";

export const createQuestionWithOptions = async (
  page: Page,
  locatingNodeSelector: string,
  questionText: string,
  options: string[]
) => {
  await page.locator(locatingNodeSelector).click();
  await page.getByRole("dialog").waitFor();
  await page.getByPlaceholder("Text").fill(questionText);

  let index = 0;
  for (const option of options) {
    await page.locator("button").filter({ hasText: "add new" }).click();
    await page.getByPlaceholder("Option").nth(index).fill(option);
    index++;
  }

  await page.locator("button").filter({ hasText: "Create question" }).click();
};

export const createNotice = async (
  page: Page,
  locatingNode: Locator,
  noticeText: string
) => {
  await locatingNode.click();
  await page.getByRole("dialog").waitFor();
  await page.locator("select").selectOption({ label: "Notice" });
  await page.getByPlaceholder("Notice").fill(noticeText);
  await page.locator("button").filter({ hasText: "Create notice" }).click();
};

export const createChecklist = async (
  page: Page,
  locatingNode: Locator,
  checklistTitle: string,
  checklistOptions: string[]
) => {
  await locatingNode.click();
  await page.getByRole("dialog").waitFor();
  await page.locator("select").selectOption({ label: "Checklist" });
  await page.getByPlaceholder("Text").fill(checklistTitle);

  let index = 0;
  for (const option of checklistOptions) {
    await page.locator("button").filter({ hasText: "add new option" }).click();
    await page.getByPlaceholder("Option").nth(index).fill(option);
    index++;
  }
  await page.locator("button").filter({ hasText: "Create checklist" }).click();
};

export const createTextInput = async (
  page: Page,
  locatingNode: Locator,
  inputTitle: string
) => {
  await locatingNode.click();
  await page.getByRole("dialog").waitFor();
  await page.locator("select").selectOption({ label: "Text Input" });
  await page.getByPlaceholder("Title").fill(inputTitle);
  await page.locator("button").filter({ hasText: "Create text-input" }).click();
};

export const createNumberInput = async (
  page: Page,
  locatingNode: Locator,
  inputTitle: string,
  inputUnits: string
) => {
  await locatingNode.click();
  await page.getByRole("dialog").waitFor();
  await page.locator("select").selectOption({ label: "Number Input" });
  await page.getByPlaceholder("Title").fill(inputTitle);
  await page.getByPlaceholder("eg square metres").fill(inputUnits);
  await page
    .locator("button")
    .filter({ hasText: "Create number-input" })
    .click();
};

export const createDateInput = async (
  page: Page,
  locatingNode: Locator,
  inputTitle: string
) => {
  await locatingNode.click();
  await page.getByRole("dialog").waitFor();
  await page.locator("select").selectOption({ label: "Date Input" });
  await page.getByPlaceholder("Title").fill(inputTitle);
  await page.locator("id=undefined-min-day").fill("01");
  await page.locator("id=undefined-min-month").fill("01");
  await page.locator("id=undefined-min-year").fill("1800");
  await page.locator("id=undefined-max-day").fill("31");
  await page.locator("id=undefined-max-month").fill("12");
  await page.locator("id=undefined-max-year").fill("2199");

  await page.locator("button").filter({ hasText: "Create date-input" }).click();
};

export const createAddressInput = async (
  page: Page,
  locatingNode: Locator,
  inputTitle: string,
  inputDataField: string
) => {
  await locatingNode.click();
  await page.getByRole("dialog").waitFor();
  await page.locator("select").selectOption({ label: "Address Input" });
  await page.getByPlaceholder("Title").fill(inputTitle);
  await page.getByPlaceholder("Data Field").fill(inputDataField);

  await page
    .locator("button")
    .filter({ hasText: "Create address-input" })
    .click();
};

export const createContactInput = async (
  page: Page,
  locatingNode: Locator,
  inputTitle: string,
  inputDataField: string
) => {
  await locatingNode.click();
  await page.getByRole("dialog").waitFor();
  await page.locator("select").selectOption({ label: "Contact Input" });
  await page.getByPlaceholder("Title").fill(inputTitle);
  await page.getByPlaceholder("Data Field").fill(inputDataField);

  await page
    .locator("button")
    .filter({ hasText: "Create contact-input" })
    .click();
};
