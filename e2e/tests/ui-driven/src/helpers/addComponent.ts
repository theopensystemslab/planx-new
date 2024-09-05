import { Locator, Page } from "@playwright/test";

enum PlanXEditorComponent {
  QUESTION = "Question",
  NOTICE = "Notice",
  CHECKLIST = "Checklist",
  TEXT = "Text Input",
  NUMBER = "Number Input",
  DATE = "Date Input",
  ADDRESS = "Address Input",
  CONTACT = "Contact Input",
  TASKLIST = "Task List",
  REVIEW = "Review",
  FIND_PROPERTY = "Find property",
  PLANNING_CONSTRAINTS = "Planning constraints",
  DRAW_BOUNDARY = "Draw boundary",
  NEXT_STEPS = "Next steps",
}

const createBaseComponent = async (
  page: Page,
  locatingNode: Locator,
  type: PlanXEditorComponent,
  title?: string,
  options?: string[]
) => {
  await locatingNode.click();
  await page.getByRole("dialog").waitFor();
  await page.locator("select").selectOption({ label: type });

  switch (type) {
    case PlanXEditorComponent.QUESTION:
      await page.getByPlaceholder("Text").fill(title || "");
      if (options) {
        await createComponentOptions(options, "add new", page);
      }
      break;
    case PlanXEditorComponent.NOTICE:
      await page.getByPlaceholder("Notice").fill(title || "");
      break;
    case PlanXEditorComponent.CHECKLIST:
      await page.getByPlaceholder("Text").fill(title || "");
      if (options) {
        await createComponentOptions(options, "add new option", page);
      }
      break;
    case PlanXEditorComponent.TEXT:
      await page.getByPlaceholder("Title").fill(title || "");
      break;
    case PlanXEditorComponent.NUMBER:
      await page.getByPlaceholder("Title").fill(title || "");
      await page.getByPlaceholder("eg square metres").fill(options?.[0] || "");
      break;
    case PlanXEditorComponent.DATE:
      await page.getByPlaceholder("Title").fill(title || "");
      // fill with hardcoded dates for now
      await page.locator("id=undefined-min-day").fill("01");
      await page.locator("id=undefined-min-month").fill("01");
      await page.locator("id=undefined-min-year").fill("1800");
      await page.locator("id=undefined-max-day").fill("31");
      await page.locator("id=undefined-max-month").fill("12");
      await page.locator("id=undefined-max-year").fill("2199");
      break;
    case PlanXEditorComponent.ADDRESS:
      await page.getByPlaceholder("Title").fill(title || "");
      await page.getByPlaceholder("Data Field").fill(options?.[0] || "");
      break;
    case PlanXEditorComponent.CONTACT:
      await page.getByPlaceholder("Title").fill(title || "");
      await page.getByPlaceholder("Data Field").fill(options?.[0] || "");
      break;
    case PlanXEditorComponent.TASKLIST:
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
    case PlanXEditorComponent.REVIEW:
      // Don't need to change anything so dummy click
      await page
        .getByPlaceholder("Check your answers before sending your application")
        .click();
      break;
    case PlanXEditorComponent.FIND_PROPERTY:
      // use default placeholder 'Find the property'
      await page.getByPlaceholder("Title").click();
      break;
    case PlanXEditorComponent.PLANNING_CONSTRAINTS:
      await page.getByPlaceholder(type).click();
      break;
    case PlanXEditorComponent.DRAW_BOUNDARY:
      page.getByPlaceholder(type);
      break;
    case PlanXEditorComponent.NEXT_STEPS:
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
    default:
      throw new Error(`Unsupported type: ${type}`);
  }

  // convert type name to lowercase, with dashes if there are spaces
  // or custom name if it doesn't fit the pattern
  const buttonName =
    type === PlanXEditorComponent.FIND_PROPERTY
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
    PlanXEditorComponent.QUESTION,
    questionText,
    options
  );
};

export const createNotice = async (
  page: Page,
  locatingNode: Locator,
  noticeText: string
) => {
  await createBaseComponent(
    page,
    locatingNode,
    PlanXEditorComponent.NOTICE,
    noticeText
  );
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
    PlanXEditorComponent.CHECKLIST,
    checklistTitle,
    checklistOptions
  );
};

export const createTextInput = async (
  page: Page,
  locatingNode: Locator,
  inputTitle: string
) => {
  await createBaseComponent(
    page,
    locatingNode,
    PlanXEditorComponent.TEXT,
    inputTitle
  );
};

export const createNumberInput = async (
  page: Page,
  locatingNode: Locator,
  inputTitle: string,
  inputUnits: string
) => {
  await createBaseComponent(
    page,
    locatingNode,
    PlanXEditorComponent.NUMBER,
    inputTitle,
    [inputUnits]
  );
};

export const createDateInput = async (
  page: Page,
  locatingNode: Locator,
  inputTitle: string
) => {
  await createBaseComponent(
    page,
    locatingNode,
    PlanXEditorComponent.DATE,
    inputTitle
  );
};

export const createAddressInput = async (
  page: Page,
  locatingNode: Locator,
  inputTitle: string,
  inputDataField: string
) => {
  await createBaseComponent(
    page,
    locatingNode,
    PlanXEditorComponent.ADDRESS,
    inputTitle,
    [inputDataField]
  );
};

export const createContactInput = async (
  page: Page,
  locatingNode: Locator,
  inputTitle: string,
  inputDataField: string
) => {
  await createBaseComponent(
    page,
    locatingNode,
    PlanXEditorComponent.CONTACT,
    inputTitle,
    [inputDataField]
  );
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
    PlanXEditorComponent.TASKLIST,
    title,
    taskListOptions
  );
};

export const createReview = async (page: Page, locatingNode: Locator) => {
  await createBaseComponent(page, locatingNode, PlanXEditorComponent.REVIEW);
};

export const createFindProperty = async (page: Page, locatingNode: Locator) => {
  await createBaseComponent(
    page,
    locatingNode,
    PlanXEditorComponent.FIND_PROPERTY
  );
};

export const createPlanningConstraints = async (
  page: Page,
  locatingNode: Locator
) => {
  await createBaseComponent(
    page,
    locatingNode,
    PlanXEditorComponent.PLANNING_CONSTRAINTS
  );
};

export const createDrawBoundary = async (page: Page, locatingNode: Locator) => {
  await createBaseComponent(
    page,
    locatingNode,
    PlanXEditorComponent.DRAW_BOUNDARY
  );
};

export const createNextSteps = async (
  page: Page,
  locatingNode: Locator,
  nextSteps: string[]
) => {
  await createBaseComponent(
    page,
    locatingNode,
    PlanXEditorComponent.NEXT_STEPS,
    undefined,
    nextSteps
  );
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
