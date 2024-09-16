import { expect, type Locator, type Page } from "@playwright/test";
import { createQuestionWithOptions } from "../helpers/addComponent";

export class PlaywrightEditor {
  readonly page: Page;
  readonly addNewServiceButton: Locator;
  readonly firstNode: Locator;
  readonly questionText: string;

  constructor(page: Page) {
    this.page = page;
    this.addNewServiceButton = page.locator("button", {
      hasText: "Add a new service",
    });
    this.firstNode = page.locator("li.hanger > a").first();
    this.questionText = "Is this a test?";
  }

  async addNewService() {
    await this.addNewServiceButton.click();
  }

  async createQuestion() {
    await createQuestionWithOptions(
      this.page,
      this.firstNode,
      this.questionText,
      ["Yes", "No"]
    );
    await expect(
      this.page.locator("a").filter({ hasText: this.questionText })
    ).toBeVisible();
  }

  async inspectNodes() {
    const nodes = this.page.locator(".card");
    await expect(nodes.getByText(this.questionText)).toBeVisible();
  }
}
