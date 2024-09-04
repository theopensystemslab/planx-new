import { Locator, Page } from "@playwright/test";

const createBaseInput = async (
  page: Page,
  locatingNode: Locator,
  type: string,
  title?: string,
  options?: string[]
) => {
  await locatingNode.click();
  await page.getByRole("dialog").waitFor();
  await page.locator("select").selectOption({ label: type });

  switch (type) {
    case "Question":
      await page.getByPlaceholder("Text").fill(title || "");
      if (options) {
        await createOptions(options, "add new", page);
      }
      break;
    case "Notice":
      await page.getByPlaceholder("Notice").fill(title || "");
      break;
    case "Checklist":
      await page.getByPlaceholder("Text").fill(title || "");
      if (options) {
        await createOptions(options, "add new option", page);
      }
      break;
    case "Text Input":
      await page.getByPlaceholder("Title").fill(title || "");
      break;
    case "Number Input":
      await page.getByPlaceholder("Title").fill(title || "");
      await page.getByPlaceholder("eg square metres").fill(options?.[0] || "");
      break;
    case "Date Input":
      await page.getByPlaceholder("Title").fill(title || "");
      // fill with hardcoded dates for now
      await page.locator("id=undefined-min-day").fill("01");
      await page.locator("id=undefined-min-month").fill("01");
      await page.locator("id=undefined-min-year").fill("1800");
      await page.locator("id=undefined-max-day").fill("31");
      await page.locator("id=undefined-max-month").fill("12");
      await page.locator("id=undefined-max-year").fill("2199");
      break;
    case "Address Input":
      await page.getByPlaceholder("Title").fill(title || "");
      await page.getByPlaceholder("Data Field").fill(options?.[0] || "");
      break;
    case "Contact Input":
      await page.getByPlaceholder("Title").fill(title || "");
      await page.getByPlaceholder("Data Field").fill(options?.[0] || "");
      break;
    default:
      throw new Error(`Unsupported type: ${type}`);
  }

  // convert type name to lowercase, with dashes if there are spaces
  const buttonName = type.toLowerCase().replace(/\s/g, "-");
  await page
    .locator("button")
    .filter({
      hasText: `Create ${buttonName}`,
    })
    .click();
};

export const createQuestionWithOptions = async (
  page: Page,
  locatingNode: Locator,
  questionText: string,
  options: string[]
) => {
  await createBaseInput(page, locatingNode, "Question", questionText, options);
};

export const createNotice = async (
  page: Page,
  locatingNode: Locator,
  noticeText: string
) => {
  await createBaseInput(page, locatingNode, "Notice", noticeText);
};

export const createChecklist = async (
  page: Page,
  locatingNode: Locator,
  checklistTitle: string,
  checklistOptions: string[]
) => {
  createBaseInput(
    page,
    locatingNode,
    "Checklist",
    checklistTitle,
    checklistOptions
  );
};

export const createTextInput = async (
  page: Page,
  locatingNode: Locator,
  inputTitle: string
) => {
  await createBaseInput(page, locatingNode, "Text Input", inputTitle);
};

export const createNumberInput = async (
  page: Page,
  locatingNode: Locator,
  inputTitle: string,
  inputUnits: string
) => {
  await createBaseInput(page, locatingNode, "Number Input", inputTitle, [
    inputUnits,
  ]);
};

export const createDateInput = async (
  page: Page,
  locatingNode: Locator,
  inputTitle: string
) => {
  await createBaseInput(page, locatingNode, "Date Input", inputTitle);
};

export const createAddressInput = async (
  page: Page,
  locatingNode: Locator,
  inputTitle: string,
  inputDataField: string
) => {
  await createBaseInput(page, locatingNode, "Address Input", inputTitle, [
    inputDataField,
  ]);
};

export const createContactInput = async (
  page: Page,
  locatingNode: Locator,
  inputTitle: string,
  inputDataField: string
) => {
  await createBaseInput(page, locatingNode, "Contact Input", inputTitle, [
    inputDataField,
  ]);
};
async function createOptions(
  options: string[],
  buttonText: string,
  page: Page
) {
  let index = 0;
  for (const option of options) {
    await page.locator("button").filter({ hasText: buttonText }).click();
    await page.getByPlaceholder("Option").nth(index).fill(option);
    index++;
  }
}
