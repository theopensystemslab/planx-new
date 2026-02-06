import { Browser, expect, test } from "@playwright/test";
import { createExternalPortal } from "./helpers/addComponent.js";
import {
  contextDefaults,
  setUpTestContext,
  tearDownTestContext,
} from "./helpers/context.js";
import { getTeamPage } from "./helpers/getPage.js";
import {
  createAuthenticatedSession,
  filterFlags,
  selectedFlag,
} from "./helpers/globalHelpers.js";
import {
  navigateToService,
  publishService,
  turnServiceOnline,
} from "./helpers/navigateAndPublish.js";
import {
  externalPortalFlowData,
  externalPortalServiceProps,
} from "./helpers/serviceData.js";
import { TestContext } from "./helpers/types.js";
import {
  answerAddressInput,
  answerChecklist,
  answerContactInput,
  answerDateInput,
  answerListInput,
  answerNumberInput,
  answerQuestion,
  answerTextInput,
  clickContinue,
} from "./helpers/userActions.js";
import { PlaywrightEditor } from "./pages/Editor.js";

test.describe("Flow creation, publish and preview", () => {
  let context: TestContext = {
    ...contextDefaults,
  };
  const serviceProps = {
    name: "A Test Service",
    slug: "a-test-service",
  };

  test.beforeAll(async () => {
    try {
      context = await setUpTestContext(context);
    } catch (error) {
      // ensure proper teardown if setup fails
      await tearDownTestContext();
      throw error;
    }
  });

  test.afterAll(async () => {
    await tearDownTestContext();
  });

  test("Create a flow", async ({ browser }) => {
    test.setTimeout(70_000);

    const page = await getTeamPage({
      browser,
      userId: context.user!.id!,
      teamName: context.team.name,
    });

    const editor = new PlaywrightEditor(page);

    await editor.addNewService({ name: serviceProps.name });

    // update context to allow flow to be torn down
    context.flow = { ...serviceProps };

    await editor.createQuestion();
    await editor.createNoticeOnEachBranch();
    await editor.createChecklist();
    await editor.createTextInput();
    await editor.createNumberInput();
    await editor.createDateInput();
    await editor.createAddressInput();
    await editor.createContactInput();
    await editor.createList();
    await editor.createTaskList();
    await editor.createContent();
    await editor.createFilter();
    await editor.createResult();
    await editor.createNextSteps();
    await editor.createReview();
    await editor.createFeedback();
    await editor.createConfirmation();

    await expect(editor.nodeList).toContainText([
      "Is this a test?",
      "Yes! this is a test",
      "Sorry, this is a test",
      "Checklist item 1",
      "Tell us about your trees.",
      "How old are you?",
      "When is your birthday?",
      "What is your address?",
      "What is your contact info?",
      "A list title",
      "What you should do next",
      "Some content",
      ...filterFlags,
      "Planning permission", // default result flag
      "Next steps",
      "Check your answers before sending your form",
      "Tell us what you think",
      "Confirmation",
    ]);
  });

  test("Cannot preview an offline flow (published by default)", async ({
    browser,
  }: {
    browser: Browser;
  }) => {
    const page = await createAuthenticatedSession({
      browser,
      userId: context.user!.id!,
    });

    await page.goto(
      `/${context.team.slug}/${serviceProps.slug}/published?analytics=false`,
    );

    await expect(
      page.getByRole("heading", { level: 1, name: "Offline" }),
    ).toBeVisible();
  });

  test("Turn a flow online", async ({ browser }) => {
    const page = await createAuthenticatedSession({
      browser,
      userId: context.user!.id!,
    });

    await navigateToService(page, serviceProps.slug);
    await turnServiceOnline(page);

    // Exit back to main Editor page
    page.locator('[aria-label="Editor"]').click();

    const previewLink = page.getByRole("link", {
      name: "Open published flow",
    });
    await expect(previewLink).toBeVisible();
  });

  test("Can add an external portal", async ({
    browser,
  }: {
    browser: Browser;
  }) => {
    const page = await createAuthenticatedSession({
      browser,
      userId: context.user!.id!,
    });

    await page.goto(`/app/${context.team.slug}`);

    const editor = new PlaywrightEditor(page);

    await editor.addNewService({ name: externalPortalServiceProps.name });

    // update context to allow new flow to be torn down
    context.externalPortalFlow = { ...externalPortalServiceProps };

    const { title, answers } = externalPortalFlowData;

    await editor.createQuestionWithOptions(title, answers);

    await expect(editor.nodeList).toContainText([
      title,
      answers[0],
      answers[1],
    ]);

    // We are publishing the Ext Portal service and turning it online
    await publishService(page);
    await turnServiceOnline(page);

    // We switch back to the original service
    await navigateToService(page, serviceProps.slug);

    // Add our ext portal to the middle of the service
    await createExternalPortal(page, page.locator("li.hanger > a").nth(6));

    await expect(
      page.getByRole("link", { name: "E2E/an-external-portal-service" }),
    ).toBeVisible();

    // publish the changes we've made to the original service
    await publishService(page);
  });

  test("Can preview a published flow with an external portal", async ({
    browser,
  }: {
    browser: Browser;
  }) => {
    const page = await createAuthenticatedSession({
      browser,
      userId: context.user!.id!,
    });

    await navigateToService(page, serviceProps.slug);

    await expect(
      page.getByRole("link", { name: "E2E/an-external-portal-service" }),
    ).toBeVisible();

    const previewLink = page.getByRole("link", {
      name: "Open published flow",
    });
    await expect(previewLink).toBeVisible();

    await page.goto(
      `/${context.team.slug}/${serviceProps.slug}/published?analytics=false`,
    );

    await answerQuestion({ page, title: "Is this a test?", answer: "Yes" });
    await clickContinue({ page });
    await expect(
      page.locator("h1", { hasText: "Yes! this is a test" }),
    ).toBeVisible();

    await page.getByTestId("backButton").click();

    await answerQuestion({ page, title: "Is this a test?", answer: "No" });
    await clickContinue({ page });
    await expect(
      page.locator("h1", { hasText: "Sorry, this is a test" }),
    ).toBeVisible();
    await clickContinue({ page });

    await answerChecklist({
      page,
      title: "A checklist title",
      answers: ["Checklist item 1", "Second checklist item"],
    });
    await clickContinue({ page });

    // The external portal question has been flattened into the overall flow data structure and can be successfully navigated through
    await answerQuestion({
      page,
      title: externalPortalFlowData.title,
      answer: externalPortalFlowData.answers[0],
    });
    await clickContinue({ page });

    await answerTextInput(page, {
      expectedQuestion: "Tell us about your trees.",
      answer: "My trees are lovely",
      continueToNext: true,
    });

    await answerNumberInput(page, {
      expectedQuestion: "How old are you?",
      answer: 30,
      continueToNext: true,
    });

    await answerDateInput(page, {
      expectedQuestion: "When is your birthday?",
      day: 30,
      month: 12,
      year: 1980,
      continueToNext: true,
    });

    await answerAddressInput(page, {
      expectedQuestion: "What is your address?",
      addressLineOne: "1 Silver Street",
      town: "Bamburgh",
      postcode: "BG1 2SS",
      continueToNext: true,
    });

    await expect(
      page.locator("h1", { hasText: "What is your contact info?" }),
    ).toBeVisible();
    await answerContactInput(page, {
      firstName: "Freddie",
      lastName: "Mercury",
      phoneNumber: "01234 555555",
      email: "freddie@queen.com",
    });
    await clickContinue({ page });

    await answerListInput(page, {
      unitType: "House",
      tenure: "Market housing",
      numBedrooms: 4,
      numUnits: 3,
      continueToNext: true,
    });

    await expect(
      page.locator("h1", { hasText: "What you should do next" }),
    ).toBeVisible();
    await expect(
      page.locator("h2", { hasText: "Have a cup of tea" }),
    ).toBeVisible();
    await expect(
      page.locator("h2", { hasText: "Continue through this flow" }),
    ).toBeVisible();
    await clickContinue({ page });

    await expect(page.locator("h1", { hasText: "Some content" })).toBeVisible();
    await clickContinue({ page });

    // this is the content placed in the filtered branch
    await expect(
      page.locator("h1", {
        hasText: `This is the ${selectedFlag} filter`,
      }),
    ).toBeVisible();
    await clickContinue({ page });

    await expect(page.locator("h1", { hasText: "No result" })).toBeVisible();
    await clickContinue({ page });

    await expect(
      page.locator("h1", { hasText: "What would you like to do next?" }),
    ).toBeVisible();
    const nextStepButton = page.getByRole("button", {
      name: "A possible next step",
    });
    nextStepButton.click();

    await expect(
      page.locator("h1", {
        hasText: "Check your answers before sending your form",
      }),
    ).toBeVisible();
    await clickContinue({ page });

    await expect(
      page.locator("h1", { hasText: "Tell us what you think" }),
    ).toBeVisible();
    await clickContinue({ page });
    await expect(page.locator("h1", { hasText: "Form sent" })).toBeVisible();
  });
});
