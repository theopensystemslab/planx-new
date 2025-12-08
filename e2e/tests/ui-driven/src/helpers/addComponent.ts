import { ComponentType } from "@opensystemslab/planx-core/types";
import { expect, Locator, Page } from "@playwright/test";
import { OptionWithDataValues } from "./types.js";
import { selectedFlag } from "./globalHelpers.js";

const createBaseComponent = async (
  page: Page,
  locatingNode: Locator,
  type: ComponentType,
  title?: string,
  options?: string[],
) => {
  await locatingNode.click();
  await page.getByRole("dialog").waitFor();
  const headerSelect = page.getByRole("heading", { name: "Question close" });
  await headerSelect.locator("select").selectOption({ value: type.toString() });

  await expect(page.getByTestId("header-select")).toHaveValue(type.toString());

  switch (type) {
    case ComponentType.Question:
      await page.getByPlaceholder("Text").fill(title || "");
      if (options) {
        await createComponentOptions(options, "Add option", page);
      }
      break;
    case ComponentType.Notice:
      await page.getByPlaceholder("Notice").fill(title || "");
      break;
    case ComponentType.Checklist:
      await page.getByPlaceholder("Text").fill(title || "");
      if (options) {
        await createComponentOptions(options, "Add option", page);
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
      await page.getByRole("combobox", { name: "Data field" }).click();
      await page
        .getByRole("combobox", { name: "Data field" })
        .fill(options?.[0] || "proposal.address");
      await page.getByRole("combobox", { name: "Data field" }).press("Enter");
      break;
    case ComponentType.ContactInput:
      await page.getByPlaceholder("Title").fill(title || "");
      await page.getByRole("combobox", { name: "Data field" }).click();
      await page
        .getByRole("combobox", { name: "Data field" })
        .fill(options?.[0] || "proposal.contact");
      await page.getByRole("combobox", { name: "Data field" }).press("Enter");
      break;
    case ComponentType.TaskList:
      await page.getByPlaceholder("Main Title").fill(title || "");
      if (options) {
        let index = 0;
        for (const option of options) {
          await page.locator("button").filter({ hasText: "Add task" }).click();
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
        .getByPlaceholder("Check your answers before sending your form")
        .click();
      break;
    case ComponentType.FindProperty:
      break;
    case ComponentType.PropertyInformation:
      await page.getByLabel("Show users a 'change' link to").click();
      break;
    case ComponentType.PlanningConstraints:
      await page.getByText("via Planning Data: conservation-area").click();
      break;
    case ComponentType.DrawBoundary:
      break;
    case ComponentType.Result:
      break;
    case ComponentType.Confirmation:
      break;
    case ComponentType.NextSteps:
      if (options) {
        let index = 0;
        for (const option of options) {
          await page.locator("button").filter({ hasText: "Add step" }).click();
          await page
            .getByPlaceholder("Title")
            .nth(index + 1) // ignore the main title field
            .fill(option);
          index++;
        }
      }
      break;
    case ComponentType.FileUpload:
      await page.getByRole("combobox", { name: "Data field" }).click();
      await page
        .getByRole("combobox", { name: "Data field" })
        .fill(options?.[0] || "otherDocument");
      await page.getByRole("combobox", { name: "Data field" }).press("Enter");
      break;
    case ComponentType.FileUploadAndLabel:
      await page.getByPlaceholder("File type").fill(options?.[0] || "");
      await page.getByRole("combobox", { name: "Data field" }).click();
      await page
        .getByRole("combobox", { name: "Data field" })
        .fill(options?.[1] || "otherDocument");
      await page.getByRole("combobox", { name: "Data field" }).press("Enter");
      break;
    case ComponentType.List:
      await page.getByPlaceholder("Title").fill(title || "");
      await page.getByRole("combobox", { name: "Data field" }).click();
      await page
        .getByRole("combobox", { name: "Data field" })
        .fill(options?.[0] || "proposal.list");
      await page.getByRole("combobox", { name: "Data field" }).press("Enter");
      break;
    case ComponentType.Content: {
      // Type content
      await page
        .locator("p[data-placeholder='Content']")
        .fill(options?.[0] || "");
      // Highlight text
      await page
        .locator('div[contenteditable="true"][role="textbox"][name="content"]')
        .selectText();
      // Create H1 to meet a11y requirements
      await page.getByRole("button", { name: "H1" }).click();
      break;
    }
    case ComponentType.Filter:
      await page
        .getByTestId("flagset-category-select")
        .selectOption(selectedFlag);
      break;
    case ComponentType.Feedback:
      break;
    case ComponentType.InternalPortal:
      await page.getByPlaceholder("Portal name").fill(title || "");
      break;
    case ComponentType.ExternalPortal:
      page.getByTestId("flowId").click();

      // wait until we can see the group header of the autocomplete
      await expect(page.getByText("E2E Test Team")).toBeVisible();

      // click the option with the service name
      page.getByText("An External Portal Service").click();

      // wait for the group header of the autocomplete to disappear
      await expect(page.getByText("E2E Test Team")).toBeHidden();
      break;
    default:
      throw new Error(`Unsupported type: ${type}`);
  }

  await page.locator('button[form="modal"][type="submit"]').click();
  await page.getByRole("dialog").waitFor({ state: "detached" });
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

export const createQuestionWithDataFieldOptions = async (
  page: Page,
  locatingNode: Locator,
  questionText: string,
  options: OptionWithDataValues[],
  dataField: string,
) => {
  await locatingNode.click();
  await page.getByRole("dialog").waitFor();
  await page.getByPlaceholder("Text").fill(questionText);
  await page.getByRole("combobox", { name: "Data field" }).click();
  await page.getByRole("combobox", { name: "Data field" }).fill(dataField);
  await page.getByRole("combobox", { name: "Data field" }).press("Enter");
  await createComponentOptionsWithDataValues(page, options);
  await page.locator('button[form="modal"][type="submit"]').click();
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

export const createPropertyInformation = async (
  page: Page,
  locatingNode: Locator,
) => {
  await createBaseComponent(
    page,
    locatingNode,
    ComponentType.PropertyInformation,
  );
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

  await page.getByPlaceholder("Flags (up to one per category)").nth(1).click();
  await page.getByRole("option", { name: selectedFlag, exact: true }).click();
}

async function createComponentOptionsWithDataValues(
  page: Page,
  options: OptionWithDataValues[],
) {
  for (const option of options) {
    await page.locator("button").filter({ hasText: "Add option" }).click();
    await page.getByPlaceholder("Option").last().fill(option.optionText);
    await page.getByRole("combobox", { name: "Data field" }).last().click();
    await page
      .getByRole("option", { name: option.dataValue, exact: true })
      .click();
  }
}

export const createList = async (
  page: Page,
  locatingNode: Locator,
  inputTitle: string,
  inputDataField: string,
) => {
  await createBaseComponent(
    page,
    locatingNode,
    ComponentType.List,
    inputTitle,
    [inputDataField],
  );
};

export const createResult = async (page: Page, locatingNode: Locator) => {
  await createBaseComponent(page, locatingNode, ComponentType.Result);
};

export const createConfirmation = async (page: Page, locatingNode: Locator) => {
  await createBaseComponent(page, locatingNode, ComponentType.Confirmation);
};

export const createUploadAndLabel = async (
  page: Page,
  locatingNode: Locator,
  fileType: string,
  dataField: string,
) => {
  await createBaseComponent(
    page,
    locatingNode,
    ComponentType.FileUploadAndLabel,
    undefined,
    [fileType, dataField],
  );
};

export const createContent = async (
  page: Page,
  locatingNode: Locator,
  content: string,
) => {
  await createBaseComponent(
    page,
    locatingNode,
    ComponentType.Content,
    undefined,
    [content],
  );
};

export const createFilter = async (page: Page, locatingNode: Locator) => {
  await createBaseComponent(page, locatingNode, ComponentType.Filter);
};

export const createInternalPortal = async (
  page: Page,
  locatingNode: Locator,
  portalName: string,
) => {
  await createBaseComponent(
    page,
    locatingNode,
    ComponentType.InternalPortal,
    portalName,
  );
};

export const createFeedback = async (page: Page, locatingNode: Locator) => {
  await createBaseComponent(page, locatingNode, ComponentType.Feedback);
};

export const createExternalPortal = async (
  page: Page,
  locatingNode: Locator,
) => {
  await createBaseComponent(page, locatingNode, ComponentType.ExternalPortal);
};
