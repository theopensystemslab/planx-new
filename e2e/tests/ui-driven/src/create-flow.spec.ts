import { Browser, expect, test } from "@playwright/test";
import type { Context } from "./helpers/context";
import {
  contextDefaults,
  setUpTestContext,
  tearDownTestContext,
} from "./helpers/context";
import { getTeamPage } from "./helpers/getPage";
import { createAuthenticatedSession } from "./helpers/globalHelpers";
import {
  answerAddressInput,
  answerContactInput,
  answerDateInput,
  answerListInput,
  answerNumberInput,
  answerQuestion,
  answerTextInput,
  clickContinue,
} from "./helpers/userActions";
import { PlaywrightEditor } from "./pages/Editor";

test.describe("Flow creation, publish and preview", () => {
  let context: Context = {
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
      await tearDownTestContext(context);
      throw error;
    }
  });

  test.afterAll(async () => {
    await tearDownTestContext(context);
  });

  test("Create a flow", async ({ browser }) => {
    const page = await getTeamPage({
      browser,
      userId: context.user!.id!,
      teamName: context.team.name,
    });

    const editor = new PlaywrightEditor(page);

    page.on("dialog", (dialog) => dialog.accept(serviceProps.name));
    await editor.addNewService();

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
    await editor.createInternalPortal();
    await editor.createResult();
    await editor.createNextSteps();
    await editor.createReview();
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
      "(Flags Filter)",
      "an internal portal",
      "Planning permission", // default result flag
      "Next steps",
      "Check your answers before sending your application",
      "Confirmation",
    ]);
  });

  test("Cannot preview an unpublished flow", async ({
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

    await expect(page.getByText("Not Found")).toBeVisible();
  });

  test("Publish a flow", async ({ browser }) => {
    const page = await createAuthenticatedSession({
      browser,
      userId: context.user!.id!,
    });

    await page.goto(`/${context.team.slug}/${serviceProps.slug}`);

    page.getByRole("button", { name: "CHECK FOR CHANGES TO PUBLISH" }).click();
    page.getByRole("button", { name: "PUBLISH", exact: true }).click();

    const previewLink = page.getByRole("link", {
      name: "Open published service",
    });
    await expect(previewLink).toBeVisible();
  });

  test("Cannot preview an offline flow", async ({
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

    await page.goto(`/${context.team.slug}/${serviceProps.slug}`);

    // Open flow settings
    page.locator('[aria-label="Service settings"]').click();

    // Toggle flow online
    page.getByLabel("Offline").click();
    page.getByRole("button", { name: "Save", disabled: false }).click();
    await expect(
      page.getByText("Service settings updated successfully"),
    ).toBeVisible();

    // Exit back to main Editor page
    page.locator('[aria-label="Editor"]').click();

    const previewLink = page.getByRole("link", {
      name: "Open published service",
    });
    await expect(previewLink).toBeVisible();
  });

  test("Can preview a published flow", async ({
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

    // await answerChecklist({
    //   page,
    //   title: "A checklist title",
    //   answers: ["Checklist item 1", "Second checklist item"],
    // });
    // await clickContinue({ page });

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

    await expect(page.locator("p", { hasText: "Some content" })).toBeVisible();
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
        hasText: "Check your answers before sending your application",
      }),
    ).toBeVisible();
    await clickContinue({ page });

    await expect(
      page.locator("h1", { hasText: "Application sent" }),
    ).toBeVisible();
  });
});
