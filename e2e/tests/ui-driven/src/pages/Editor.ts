import { ComponentType } from "@opensystemslab/planx-core/types";

import { expect, type Locator, type Page } from "@playwright/test";
import {
  createAddressInput,
  createChecklist,
  createConfirmation,
  createContactInput,
  createContent,
  createDateInput,
  createDrawBoundary,
  createFileUpload,
  createFilter,
  createFindProperty,
  createInternalPortal,
  createList,
  createNextSteps,
  createNotice,
  createNumberInput,
  createPlanningConstraints,
  createQuestionWithOptions,
  createResult,
  createReview,
  createTaskList,
  createTextInput,
  createUploadAndLabel,
} from "../helpers/addComponent";

export class PlaywrightEditor {
  readonly page: Page;
  readonly addNewServiceButton: Locator;
  readonly firstNode: Locator;
  readonly yesBranch: Locator;
  readonly noBranch: Locator;
  readonly nodeList: Locator;
  readonly answers: {
    questionText: string;
    yesBranchNoticeText: string;
    noBranchNoticeText: string;
  };

  constructor(page: Page) {
    this.page = page;
    this.addNewServiceButton = page.locator("button", {
      hasText: "Add a new service",
    });
    this.firstNode = page.locator("li.hanger > a").first();
    this.yesBranch = page.locator("#flow .card .options .option").nth(0);
    this.noBranch = page.locator("#flow .card .options .option").nth(1);
    this.nodeList = page.locator(".card");

    this.answers = {
      questionText: "Is this a test?",
      yesBranchNoticeText: "Yes! this is a test",
      noBranchNoticeText: "Sorry, this is a test",
    };
  }

  async addNewService() {
    await this.addNewServiceButton.click();
  }

  async createQuestion() {
    await createQuestionWithOptions(
      this.page,
      this.firstNode,
      this.answers.questionText,
      ["Yes", "No"],
    );
    await expect(
      this.page.locator("a").filter({ hasText: this.answers.questionText }),
    ).toBeVisible();
  }

  async createNoticeOnEachBranch() {
    // Add a notice to the "Yes" path
    await createNotice(
      this.page,
      this.yesBranch.locator(".hanger > a"),
      this.answers.yesBranchNoticeText,
    );
    // Add a notice to the "No" path
    await createNotice(
      this.page,
      this.noBranch.locator(".hanger > a"),
      this.answers.noBranchNoticeText,
    );

    await expect(
      this.page.locator("a").filter({ hasText: this.answers.questionText }),
    ).toBeVisible();
  }

  getNextNode() {
    return this.page.locator(".hanger > a").last();
  }

  async createChecklist() {
    await createChecklist(this.page, this.getNextNode(), "A checklist title", [
      "Checklist item 1",
      "Second checklist item",
      "The third checklist item",
    ]);
  }

  async createTextInput() {
    await createTextInput(
      this.page,
      this.getNextNode(),
      "Tell us about your trees.",
    );
  }

  async createNumberInput() {
    await createNumberInput(
      this.page,
      this.getNextNode(),
      "How old are you?",
      "years",
    );
  }

  async createDateInput() {
    await createDateInput(
      this.page,
      this.getNextNode(),
      "When is your birthday?",
    );
  }

  async createAddressInput() {
    await createAddressInput(
      this.page,
      this.getNextNode(),
      "What is your address?",
      "some data field",
    );
  }

  async createContactInput() {
    await createContactInput(
      this.page,
      this.getNextNode(),
      "What is your contact info?",
      "some data field",
    );
  }

  async createTaskList() {
    await createTaskList(
      this.page,
      this.getNextNode(),
      "What you should do next",
      ["Have a cup of tea", "Continue through this flow"],
    );
  }

  async createFindProperty() {
    await createFindProperty(this.page, this.getNextNode());
  }

  async createDrawBoundary() {
    await createDrawBoundary(this.page, this.getNextNode());
  }

  async createPlanningConstraints() {
    await createPlanningConstraints(this.page, this.getNextNode());
  }

  async createFileUpload() {
    await createFileUpload(this.page, this.getNextNode(), "some data field");
  }

  async createUploadAndLabel() {
    await createUploadAndLabel(
      this.page,
      this.getNextNode(),
      "Property title deeds",
      "some data field",
    );
  }

  async createNextSteps() {
    await createNextSteps(this.page, this.getNextNode(), [
      "A possible next step",
      "Another option",
    ]);
  }

  async createReview() {
    await createReview(this.page, this.getNextNode());
  }

  async createList() {
    await createList(
      this.page,
      this.getNextNode(),
      "A list title",
      "some data field",
    );
  }
  async createResult() {
    await createResult(this.page, this.getNextNode());
  }

  async createConfirmation() {
    await createConfirmation(this.page, this.getNextNode());
  }

  async createContent() {
    await createContent(this.page, this.getNextNode(), "Some content");
  }

  async createFilter() {
    await createFilter(this.page, this.getNextNode());
  }

  async createInternalPortal() {
    await createInternalPortal(
      this.page,
      this.getNextNode(),
      "an internal portal",
    );
  }

  async populateInternalPortal() {
    const internalPortalButton = this.page.getByRole("link", {
      name: "an internal portal",
    });
    await internalPortalButton.click();

    // create a notice inside the portal
    await this.page.locator(".hanger > a").last().click();
    await this.page.getByRole("dialog").waitFor();
    await this.page
      .locator("select")
      .selectOption({ value: ComponentType.Notice.toString() });
    await this.page
      .getByPlaceholder("Notice")
      .fill("A notice inside a portal!");
    await this.page.locator('button[form="modal"][type="submit"]').click();
  }
}
