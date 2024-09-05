import { Locator, Page } from "@playwright/test";

const createBaseComponent = async (
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
        await createComponentOptions(options, "add new", page);
      }
      break;
    case "Notice":
      await page.getByPlaceholder("Notice").fill(title || "");
      break;
    case "Checklist":
      await page.getByPlaceholder("Text").fill(title || "");
      if (options) {
        await createComponentOptions(options, "add new option", page);
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
    case "Task List":
      await page.getByPlaceholder("Main Title").fill(title || "");
      if (options) {
        let index = 0;
        for (const option of options) {
          await page.locator("button").filter({ hasText: "add new" }).click();
          await page
            .getByPlaceholder("Title")
            .nth(index + 1) // ignore the main title field
            .fill(option);
          index++;
        }
      }
      break;
    case "Review":
      // Don't need to change anything so dummy click
      await page
        .getByPlaceholder("Check your answers before sending your application")
        .click();
      break;
    case "Find property":
      // use default placeholder 'Find the property'
      await page.getByPlaceholder("Title").click();
      break;
    case "Planning constraints":
        await page.getByPlaceholder(type).click();
      break;
    default:
      throw new Error(`Unsupported type: ${type}`);
  }

  // convert type name to lowercase, with dashes if there are spaces
  // or custom name if it doesn't fit the pattern
  const buttonName =
    type === "Find property"
      ? "find-property-merged"
      : type.toLowerCase().replace(/\s/g, "-");

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
  await createBaseComponent(
    page,
    locatingNode,
    "Question",
    questionText,
    options
  );
};

export const createNotice = async (
  page: Page,
  locatingNode: Locator,
  noticeText: string
) => {
  await createBaseComponent(page, locatingNode, "Notice", noticeText);
};

export const createChecklist = async (
  page: Page,
  locatingNode: Locator,
  checklistTitle: string,
  checklistOptions: string[]
) => {
  createBaseComponent(
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
  await createBaseComponent(page, locatingNode, "Text Input", inputTitle);
};

export const createNumberInput = async (
  page: Page,
  locatingNode: Locator,
  inputTitle: string,
  inputUnits: string
) => {
  await createBaseComponent(page, locatingNode, "Number Input", inputTitle, [
    inputUnits,
  ]);
};

export const createDateInput = async (
  page: Page,
  locatingNode: Locator,
  inputTitle: string
) => {
  await createBaseComponent(page, locatingNode, "Date Input", inputTitle);
};

export const createAddressInput = async (
  page: Page,
  locatingNode: Locator,
  inputTitle: string,
  inputDataField: string
) => {
  await createBaseComponent(page, locatingNode, "Address Input", inputTitle, [
    inputDataField,
  ]);
};

export const createContactInput = async (
  page: Page,
  locatingNode: Locator,
  inputTitle: string,
  inputDataField: string
) => {
  await createBaseComponent(page, locatingNode, "Contact Input", inputTitle, [
    inputDataField,
  ]);
};

export const createTaskList = async (
  page: Page,
  locatingNode: Locator,
  title: string,
  taskListOptions: string[]
) => {
  await createBaseComponent(
    page,
    locatingNode,
    "Task List",
    title,
    taskListOptions
  );
};

export const createReview = async (page: Page, locatingNode: Locator) => {
  await createBaseComponent(page, locatingNode, "Review");
};

export const createFindPropertyComponent = async (
  page: Page,
  locatingNode: Locator
) => {
  await createBaseComponent(page, locatingNode, "Find property");
};

export const createPlanningConstraintsComponent = async (
    page: Page,
    locatingNode: Locator
  ) => {
    await createBaseComponent(page, locatingNode, "Planning constraints");
  };

async function createComponentOptions(
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
