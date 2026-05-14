import { ComponentType } from "@opensystemslab/planx-core/types";
import { expect, test } from "@playwright/test";
import {
  contextDefaults,
  setUpTestContext,
  tearDownTestContext,
} from "./helpers/context.js";
import { getTeamPage } from "./helpers/getPage.js";
import {
  navigateToService,
  navigateToTeamPage,
  publishService,
  turnServiceOnline,
} from "./helpers/navigateAndPublish.js";
import { createTemplatedComponent } from "./helpers/addComponent.js";
import { TestContext } from "./helpers/types.js";
import { PlaywrightEditor } from "./pages/Editor.js";

const SOURCE_TEMPLATE_NAME = "E2E Source Template";
const SOURCE_TEMPLATE_SLUG = "e2e-source-template";

const REQUIRED_NODE_TITLE = "Required node";
const UPDATED_REQUIRED_NODE_TITLE = `${REQUIRED_NODE_TITLE} (updated)`;
const REQUIRED_NODE_INSTRUCTIONS =
  "You have to customise this node before publishing";

const OPTIONAL_NODE_TITLE = "Optional node";
const UPDATED_OPTIONAL_NODE_TITLE = `${OPTIONAL_NODE_TITLE} (updated)`;
const OPTIONAL_NODE_INSTRUCTIONS =
  "You can customise this node if you feel like it";

const TEMPLATED_FLOW_NAME = `${SOURCE_TEMPLATE_NAME} (templated)`;
const TEMPLATED_FLOW_SLUG = `${SOURCE_TEMPLATE_SLUG}-templated`;

const REGULAR_FLOW_NAME = "E2E Regular Flow";

const REPUBLISH_MESSAGE = "lorem ipsum";

test.describe("Templates", () => {
  let context: TestContext = { ...contextDefaults };

  test.beforeAll(async () => {
    try {
      context = await setUpTestContext(context);
    } catch (error) {
      await tearDownTestContext();
      throw error;
    }
  });

  test.afterAll(async () => {
    await tearDownTestContext();
  });

  test.describe("As a platform admin", () => {
    test("can create a source template flow", async ({ browser }) => {
      const page = await getTeamPage({
        browser,
        userId: context.user!.id!,
        teamName: context.team.name,
      });
      const editor = new PlaywrightEditor(page);

      await editor.addNewSourceTemplate(SOURCE_TEMPLATE_NAME);

      // After creation the editor redirects us into the source template flow
      await expect(
        page.getByRole("link", { name: SOURCE_TEMPLATE_SLUG }),
      ).toBeVisible();
    });

    test("component modals show a Templates section not present in regular flows", async ({
      browser,
    }) => {
      const page = await getTeamPage({
        browser,
        userId: context.user!.id!,
        teamName: context.team.name,
      });
      await navigateToService(page, SOURCE_TEMPLATE_SLUG);

      const editor = new PlaywrightEditor(page);
      await editor.firstNode.click();
      await page.getByRole("dialog").waitFor();

      // check section is present
      await expect(
        page.getByText("This node is in a source template"),
      ).toBeVisible();

      // check "require edits" control and instructions are not initially visible
      await expect(page.getByLabel("Require edits")).not.toBeVisible();
      await expect(page.getByText("Instructions")).not.toBeVisible();

      // check "allow edits" control is visible then click it
      const allowEditsControl = page.getByLabel("Allow edits");
      await expect(allowEditsControl).toBeVisible();
      await allowEditsControl.click({ force: true });

      // check "require edits" control and instructions fields are now visible after clicking "allow edits"
      await expect(page.getByLabel("Require edits")).toBeVisible();
      await expect(page.getByText("Instructions")).toBeVisible();
      await page.getByLabel("Require edits").click({ force: true });

      // Close modal without saving
      await page.locator('button[aria-label="close"]').click();
      await page.getByRole("button", { name: "Discard changes" }).click();
      await page.getByRole("dialog").waitFor({ state: "detached" });

      // check node is not visible
      await expect(editor.nodeList).not.toContainText([REQUIRED_NODE_TITLE]);
    });

    test("can add required and optional nodes to a source template flow", async ({
      browser,
    }) => {
      const page = await getTeamPage({
        browser,
        userId: context.user!.id!,
        teamName: context.team.name,
      });
      await navigateToService(page, SOURCE_TEMPLATE_SLUG);

      const editor = new PlaywrightEditor(page);

      await createTemplatedComponent(
        page,
        editor.firstNode,
        ComponentType.Question,
        REQUIRED_NODE_TITLE,
        { instructions: REQUIRED_NODE_INSTRUCTIONS, required: true },
      );

      await createTemplatedComponent(
        page,
        editor.getNextNode(),
        ComponentType.Question,
        OPTIONAL_NODE_TITLE,
        { instructions: OPTIONAL_NODE_INSTRUCTIONS, required: false },
      );

      // Check that the required node is visible and has the "Required" label
      const requiredNode = await editor.checkNodeExists(REQUIRED_NODE_TITLE);
      await expect(
        requiredNode.getByText("Required", { exact: true }),
      ).toBeVisible();

      // Check that the optional node is visible and has the "Optional" label
      const optionalNode = await editor.checkNodeExists(OPTIONAL_NODE_TITLE);
      await expect(
        optionalNode.getByText("Optional", { exact: true }),
      ).toBeVisible();
    });

    test("can publish the source template and make it available for use", async ({
      browser,
    }) => {
      const page = await getTeamPage({
        browser,
        userId: context.user!.id!,
        teamName: context.team.name,
      });
      await navigateToService(page, SOURCE_TEMPLATE_SLUG);

      await publishService(page);

      await turnServiceOnline(page);

      await navigateToTeamPage(page);
      await expect(page.getByText(SOURCE_TEMPLATE_NAME)).toBeVisible();
    });

    test("can filter flows for source templates only", async ({ browser }) => {
      const page = await getTeamPage({
        browser,
        userId: context.user!.id!,
        teamName: context.team.name,
      });

      // Create a regular flow so we can assert it is excluded by the filter
      await page.locator("button", { hasText: "Add a new flow" }).click();
      await page.getByLabel("Flow name").fill(REGULAR_FLOW_NAME);
      await page.getByRole("button", { name: "Add flow" }).click();
      await page.locator("li.hanger > a").first().waitFor();

      await navigateToTeamPage(page);

      // Apply the "source template" filter from the Templates filter control
      await page.locator('[aria-labelledby~="Templates-label"]').click();
      await page.getByRole("option", { name: "Source template" }).click();

      await expect(page.getByText(SOURCE_TEMPLATE_NAME)).toBeVisible();
      await expect(page.getByText(REGULAR_FLOW_NAME)).not.toBeVisible();
    });
  });

  // team editor creating a flow from source template, customising it and publishing it
  // relies on the source template being online and published from the first block
  test.describe("As a team editor", () => {
    test("can create a templated flow from an available source template", async ({
      browser,
    }) => {
      const page = await getTeamPage({
        browser,
        userId: context.user!.id!,
        teamName: context.team.name,
      });
      const editor = new PlaywrightEditor(page);

      await editor.addNewFlowFromTemplate(SOURCE_TEMPLATE_NAME);

      await expect(
        page.getByRole("link", { name: TEMPLATED_FLOW_SLUG }),
      ).toBeVisible();
    });

    test("sees the Customise tab open by default with required tasks listed", async ({
      browser,
    }) => {
      const page = await getTeamPage({
        browser,
        userId: context.user!.id!,
        teamName: context.team.name,
      });
      await navigateToService(page, TEMPLATED_FLOW_SLUG);

      // The "Customise" tab is the default active tab for templated flows
      const customiseTab = page.getByRole("tab", { name: "Customise" });
      await expect(customiseTab).toBeVisible();
      await expect(customiseTab).toHaveAttribute("aria-selected", "true");

      const editor = new PlaywrightEditor(page);
      await editor.checkNodeExists(REQUIRED_NODE_TITLE);
      await editor.checkNodeExists(OPTIONAL_NODE_TITLE);
    });

    test("can filter flows for templated flows only", async ({ browser }) => {
      const page = await getTeamPage({
        browser,
        userId: context.user!.id!,
        teamName: context.team.name,
      });

      // Apply the "templated" filter from the Templates filter control
      await page.locator('[aria-labelledby~="Templates-label"]').click();
      await page.getByRole("option", { name: "Templated" }).click();

      // The templated flow card should be visible in the filtered results
      const templatedCard = page
        .locator("li")
        .filter({ hasText: TEMPLATED_FLOW_NAME })
        .first();
      await expect(templatedCard).toBeVisible();

      // The card should show a purple banner with the team name and a star icon
      await expect(templatedCard.getByText(context.team.name)).toBeVisible();
      await expect(
        templatedCard.getByTestId("templated-flow-star"),
      ).toBeVisible();

      // The source template should not appear in the filtered results
      await expect(
        page.getByText(SOURCE_TEMPLATE_NAME, { exact: true }),
      ).not.toBeVisible();
    });

    // TODO - test("Cannot add new nodes in a templated flow");

    test("cannot proceed past the Review step when required customisations are incomplete", async ({
      browser,
    }) => {
      const page = await getTeamPage({
        browser,
        userId: context.user!.id!,
        teamName: context.team.name,
      });
      await navigateToService(page, TEMPLATED_FLOW_SLUG);

      // Make a change to the flow by editing the optional template node.
      // this is required to get past the 'has any changes' step on publish
      await page.getByRole("link", { name: OPTIONAL_NODE_TITLE }).click();
      await page.getByRole("dialog").waitFor();
      await page.getByPlaceholder("Text").fill(UPDATED_OPTIONAL_NODE_TITLE);
      await page.locator('button[form="modal"][type="submit"]').click();
      await page.getByRole("dialog").waitFor({ state: "detached" });

      // Open the publish dialog
      await page.getByTestId("check-for-changes-to-publish-button").click();
      await expect(page.getByRole("heading", { name: "Review" })).toBeVisible();

      // Validation should report a failure for the uncustomised required node
      await expect(page.getByText("Fail")).toBeVisible();

      // Clicking "Next" should be blocked and show an error
      await page.getByTestId("next-step-test-button").click();
      await expect(
        page.getByText("Fix errors before continuing"),
      ).toBeVisible();

      // Close dialog and return to editor
      await page.getByRole("button", { name: "Keep editing" }).click();
    });

    test("can complete a required customisation task and then publish successfully", async ({
      browser,
    }) => {
      const page = await getTeamPage({
        browser,
        userId: context.user!.id!,
        teamName: context.team.name,
      });
      await navigateToService(page, TEMPLATED_FLOW_SLUG);

      // Edit the required templated node to satisfy the customisation requirement.
      await page.getByRole("link", { name: REQUIRED_NODE_TITLE }).click();
      await page.getByRole("dialog").waitFor();
      await page.getByPlaceholder("Text").fill(UPDATED_REQUIRED_NODE_TITLE);
      await page.locator('button[form="modal"][type="submit"]').click();
      await page.getByRole("dialog").waitFor({ state: "detached" });

      // Check that our required node is complete in the customisation task list
      const requiredCustomisationTask = page
        .locator("li")
        .filter({
          has: page.getByRole("button", { name: REQUIRED_NODE_TITLE }),
        })
        .first();

      await expect(
        requiredCustomisationTask.getByTestId("customisation-complete"),
      ).toBeVisible();

      await publishService(page);

      await navigateToTeamPage(page);
      await expect(page.getByText(TEMPLATED_FLOW_NAME)).toBeVisible();
    });
  });

  // relies on the templated flow being created in the "As a team editor" block
  test.describe("As a platform admin", () => {
    test("can publish changes to the source template and sees affected templated flows listed", async ({
      browser,
    }) => {
      const page = await getTeamPage({
        browser,
        userId: context.user!.id!,
        teamName: context.team.name,
      });
      await navigateToService(page, SOURCE_TEMPLATE_SLUG);

      // Make a change to the source template by editing the optional node
      await page.getByRole("link", { name: OPTIONAL_NODE_TITLE }).click();
      await page.getByRole("dialog").waitFor();
      await page
        .getByPlaceholder("Text")
        .fill(`${OPTIONAL_NODE_TITLE} (source updated)`);
      await page.locator('button[form="modal"][type="submit"]').click();
      await page.getByRole("dialog").waitFor({ state: "detached" });

      // Open the publish dialog and advance to the Publish step
      await page.getByTestId("check-for-changes-to-publish-button").click();
      await expect(page.getByRole("heading", { name: "Review" })).toBeVisible();
      await page.getByTestId("next-step-test-button").click();

      await expect(page.getByRole("heading", { name: "Test" })).toBeVisible();
      await page.getByTestId("test-confirmation-checkbox").click();
      await page.getByTestId("next-step-publish-button").click();

      // The Publish step should show template-specific messaging and list affected flows
      await expect(
        page.getByRole("heading", { name: "Publish" }),
      ).toBeVisible();
      await expect(page.getByText("This flow is a template")).toBeVisible();
      await expect(
        page.getByText(new RegExp(TEMPLATED_FLOW_SLUG)),
      ).toBeVisible();

      // Complete the publish
      await page.getByTestId("publish-summary-input").fill(REPUBLISH_MESSAGE);
      await page.getByTestId("publish-button").click();
      await expect(
        page.getByText("Successfully published changes").first(),
      ).toBeVisible();
    });
  });

  // relies on the source template being republished in the "As a platform admin" block above
  test.describe("As a team editor", () => {
    test("sees a History entry describing the source template update and still has Customise tasks to complete", async ({
      browser,
    }) => {
      const page = await getTeamPage({
        browser,
        userId: context.user!.id!,
        teamName: context.team.name,
      });
      await navigateToService(page, TEMPLATED_FLOW_SLUG);

      // The History tab should contain an auto-generated entry for the source template update
      await page.getByRole("tab", { name: "History" }).click();
      await expect(
        page.getByText(`Source template published: "${REPUBLISH_MESSAGE}"`),
      ).toBeVisible();

      // The Customise tab should still list the required and optional tasks
      await page.getByRole("tab", { name: "Customise" }).click();
      await expect(page.getByText(REQUIRED_NODE_INSTRUCTIONS)).toBeVisible();
      await expect(page.getByText(OPTIONAL_NODE_INSTRUCTIONS)).toBeVisible();

      // Check that our required node is complete in the customisation task list
      const requiredCustomisationTask = page
        .locator("li")
        .filter({
          has: page.getByRole("button", { name: UPDATED_REQUIRED_NODE_TITLE }),
        })
        .first();

      await expect(
        requiredCustomisationTask.getByTestId("customisation-complete"),
      ).toBeVisible();
    });
  });
});
