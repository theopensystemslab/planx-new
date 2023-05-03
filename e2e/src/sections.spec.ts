import { test } from "@playwright/test";
import { flow } from "./flows/sections-flow";
import {
  setUpTestContext,
  tearDownTestContext,
  getGraphQLClient,
} from "./context";
import {
  fillInEmail,
  answerQuestion,
  answerChecklist,
  clickContinue,
  expectNotice,
  expectSections,
  expectConfirmation,
  saveSession,
  returnToSession,
} from "./helpers";
import type { Context } from "./context";

test.describe("Sections", () => {
  const adminGQLClient = getGraphQLClient();
  let context: Context = {
    user: {
      firstName: "test",
      lastName: "test",
      email: "e2etest@test.com",
    },
    team: {
      name: "E2E Test Team",
      slug: "e2e-test-team",
      logo: "https://placedog.net/250/250",
      primaryColor: "#F30415",
      homepage: "example.com",
    },
    flow: {
      slug: "sections-test-flow",
      data: flow,
    },
  };
  const previewURL = `/${context.team?.slug}/${context.flow?.slug}/preview?analytics=false`;

  test.beforeAll(async () => {
    try {
      context = await setUpTestContext(context);
    } catch (e) {
      await tearDownTestContext(context);
      throw e;
    }
  });

  test.afterAll(async () => {
    await tearDownTestContext(context);
  });

  test.describe("simple section states", () => {
    test("the correct section statuses are displayed for a straight-through journey", async ({
      page,
    }) => {
      await page.goto(previewURL);
      await page.evaluate('featureFlags.toggle("NAVIGATION_UI")');

      await fillInEmail({ page, context });
      await clickContinue({ page, waitForResponse: true });

      await expectSections({
        page,
        sections: [
          {
            title: "Section One",
            status: "READY TO CONTINUE",
          },
          {
            title: "Section Two",
            status: "CANNOT CONTINUE YET",
          },
          {
            title: "Section Three",
            status: "CANNOT CONTINUE YET",
          },
        ],
      });
      await clickContinue({ page });

      await answerQuestion({ page, title: "Question 1", answer: "A" });
      await clickContinue({ page });

      await expectSections({
        page,
        sections: [
          {
            title: "Section One",
            status: "COMPLETED",
          },
          {
            title: "Section Two",
            status: "READY TO CONTINUE",
          },
          {
            title: "Section Three",
            status: "CANNOT CONTINUE YET",
          },
        ],
      });
      await clickContinue({ page });

      await answerQuestion({ page, title: "Question 2", answer: "B" });
      await clickContinue({ page });

      await answerChecklist({
        page,
        title: "Multi-select",
        answers: ["B", "C", "D"],
      });
      await clickContinue({ page });

      await expectNotice({ page, text: "Reached B" });
      await clickContinue({ page });

      await expectNotice({ page, text: "Reached C" });
      await clickContinue({ page });

      await expectNotice({ page, text: "Reached D" });
      await clickContinue({ page });

      await expectNotice({ page, text: "Reached the end of section two" });
      await clickContinue({ page });

      await expectSections({
        page,
        sections: [
          {
            title: "Section One",
            status: "COMPLETED",
          },
          {
            title: "Section Two",
            status: "COMPLETED",
          },
          {
            title: "Section Three",
            status: "READY TO CONTINUE",
          },
        ],
      });
      await clickContinue({ page });

      // send
      await clickContinue({ page });

      await expectConfirmation({ page, text: "Application Sent" });
    });
  });

  // TODO fix me
  test.describe.skip("save and return with no service changes", () => {
    test("the application resumes from the last unanswered question with the correct section statuses", async ({
      page,
    }) => {
      await page.goto(previewURL);
      await page.evaluate('featureFlags.toggle("NAVIGATION_UI")');

      await fillInEmail({ page, context });
      await clickContinue({ page });

      await expectSections({
        page,
        sections: [
          {
            title: "Section One",
            status: "READY TO CONTINUE",
          },
          {
            title: "Section Two",
            status: "CANNOT CONTINUE YET",
          },
          {
            title: "Section Three",
            status: "CANNOT CONTINUE YET",
          },
        ],
      });
      await clickContinue({ page });

      await answerQuestion({ page, title: "Question 1", answer: "A" });
      await clickContinue({ page });

      const sectionsBeforeSaveAndReturn = [
        {
          title: "Section One",
          status: "COMPLETED",
        },
        {
          title: "Section Two",
          status: "READY TO CONTINUE",
        },
        {
          title: "Section Three",
          status: "CANNOT CONTINUE YET",
        },
      ];
      await expectSections({
        page,
        sections: sectionsBeforeSaveAndReturn,
      });
      await clickContinue({ page });

      const sessionId = await saveSession({ page, adminGQLClient, context });
      if (!sessionId) test.fail();

      await returnToSession({ page, context, sessionId: sessionId! });
      await clickContinue({ page });

      // sections should have not changed
      await expectSections({
        page,
        sections: sectionsBeforeSaveAndReturn,
      });
    });
  });
});
