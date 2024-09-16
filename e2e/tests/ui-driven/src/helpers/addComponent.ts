import { ComponentType } from "@opensystemslab/planx-core/types";
import { Locator, Page } from "@playwright/test";

const createBaseComponent = async (
  page: Page,
  locatingNode: Locator,
  type: ComponentType,
  title?: string,
  options?: string[],
) => {
  await locatingNode.click();
  await page.getByRole("dialog").waitFor();
  await page.locator("select").selectOption({ value: type.toString() });

  switch (type) {
    case ComponentType.Question:
      await page.getByPlaceholder("Text").fill(title || "");
      if (options) {
        await createComponentOptions(options, "add new", page);
      }
      break;
    case ComponentType.Notice:
      await page.getByPlaceholder("Notice").fill(title || "");
      break;
    case ComponentType.Checklist:
      await page.getByPlaceholder("Text").fill(title || "");
      if (options) {
        await createComponentOptions(options, "add new option", page);
      }
      break;
    case ComponentType.TextInput:
      await page.getByPlaceholder("Title").fill(title || "");
      break;
    case ComponentType.NumberInput:
      await page.getByPlaceholder("Title").fill(title || "");
      await page.getByPlaceholder("eg square metres").fill(options?.[0] || "");
      break;
    case ComponentType.DateInput:
      await page.getByPlaceholder("Title").fill(title || "");
      // fill with hardcoded dates for now
      await page.locator("id=undefined-min-day").fill("01");
      await page.locator("id=undefined-min-month").fill("01");
      await page.locator("id=undefined-min-year").fill("1800");
      await page.locator("id=undefined-max-day").fill("31");
      await page.locator("id=undefined-max-month").fill("12");
      await page.locator("id=undefined-max-year").fill("2199");
      break;
    case ComponentType.AddressInput:
      await page.getByPlaceholder("Title").fill(title || "");
      await page.getByPlaceholder("Data Field").fill(options?.[0] || "");
      break;
    case ComponentType.ContactInput:
      await page.getByPlaceholder("Title").fill(title || "");
      await page.getByPlaceholder("Data Field").fill(options?.[0] || "");
      break;
    case ComponentType.TaskList:
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
    case ComponentType.Review:
      // Don't need to change anything so dummy click
      await page
        .getByPlaceholder("Check your answers before sending your application")
        .click();
      break;
    case ComponentType.FindProperty:
      break;
    case ComponentType.PlanningConstraints:
      break;
    case ComponentType.DrawBoundary:
      break;
    case ComponentType.NextSteps:
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
    case ComponentType.FileUpload:
      await page.getByPlaceholder("Data Field").fill(options?.[0] || "");

      break;
    default:
      throw new Error(`Unsupported type: ${type}`);
  }

  await page.locator('button[form="modal"][type="submit"]').click();
};

export const createQuestionWithOptions = async (
  page: Page,
  locatingNode: Locator,
  questionText: string,
  options: string[],
) => {
  await createBaseComponent(
    page,
    locatingNode,
    ComponentType.Question,
    questionText,
    options,
  );
};

export const createNotice = async (
  page: Page,
  locatingNode: Locator,
  noticeText: string,
) => {
  await createBaseComponent(
    page,
    locatingNode,
    ComponentType.Notice,
    noticeText,
  );
};

export const createChecklist = async (
  page: Page,
  locatingNode: Locator,
  checklistTitle: string,
  checklistOptions: string[],
) => {
  await createBaseComponent(
    page,
    locatingNode,
    ComponentType.Checklist,
    checklistTitle,
    checklistOptions,
  );
};

export const createTextInput = async (
  page: Page,
  locatingNode: Locator,
  inputTitle: string,
) => {
  await createBaseComponent(
    page,
    locatingNode,
    ComponentType.TextInput,
    inputTitle,
  );
};

export const createNumberInput = async (
  page: Page,
  locatingNode: Locator,
  inputTitle: string,
  inputUnits: string,
) => {
  await createBaseComponent(
    page,
    locatingNode,
    ComponentType.NumberInput,
    inputTitle,
    [inputUnits],
  );
};

export const createDateInput = async (
  page: Page,
  locatingNode: Locator,
  inputTitle: string,
) => {
  await createBaseComponent(
    page,
    locatingNode,
    ComponentType.DateInput,
    inputTitle,
  );
};

export const createAddressInput = async (
  page: Page,
  locatingNode: Locator,
  inputTitle: string,
  inputDataField: string,
) => {
  await createBaseComponent(
    page,
    locatingNode,
    ComponentType.AddressInput,
    inputTitle,
    [inputDataField],
  );
};

export const createContactInput = async (
  page: Page,
  locatingNode: Locator,
  inputTitle: string,
  inputDataField: string,
) => {
  await createBaseComponent(
    page,
    locatingNode,
    ComponentType.ContactInput,
    inputTitle,
    [inputDataField],
  );
};

export const createTaskList = async (
  page: Page,
  locatingNode: Locator,
  title: string,
  taskListOptions: string[],
) => {
  await createBaseComponent(
    page,
    locatingNode,
    ComponentType.TaskList,
    title,
    taskListOptions,
  );
};

export const createReview = async (page: Page, locatingNode: Locator) => {
  await createBaseComponent(page, locatingNode, ComponentType.Review);
};

export const createFindProperty = async (page: Page, locatingNode: Locator) => {
  await createBaseComponent(page, locatingNode, ComponentType.FindProperty);
};

export const createPlanningConstraints = async (
  page: Page,
  locatingNode: Locator,
) => {
  await createBaseComponent(
    page,
    locatingNode,
    ComponentType.PlanningConstraints,
  );
};

export const createDrawBoundary = async (page: Page, locatingNode: Locator) => {
  await createBaseComponent(page, locatingNode, ComponentType.DrawBoundary);
};

export const createNextSteps = async (
  page: Page,
  locatingNode: Locator,
  nextSteps: string[],
) => {
  await createBaseComponent(
    page,
    locatingNode,
    ComponentType.NextSteps,
    undefined,
    nextSteps,
  );
};

export const createFileUpload = async (
  page: Page,
  locatingNode: Locator,
  dataField: string,
) => {
  await createBaseComponent(
    page,
    locatingNode,
    ComponentType.FileUpload,
    undefined,
    [dataField],
  );
};

async function createComponentOptions(
  options: string[],
  buttonText: string,
  page: Page,
) {
  let index = 0;
  for (const option of options) {
    await page.locator("button").filter({ hasText: buttonText }).click();
    await page.getByPlaceholder("Option").nth(index).fill(option);
    index++;
  }
}
