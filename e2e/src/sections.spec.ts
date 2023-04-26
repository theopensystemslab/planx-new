import { test } from "@playwright/test";
import { flow, updatedQuestionAnswers } from "./flows/sections-flow";
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
  clickBack,
  expectNotice,
  expectSections,
  expectConfirmation,
  saveSession,
  returnToSession,
} from "./helpers";
import { gql } from "graphql-request";
import type { Context } from "./context";
import type { FlowGraph } from "@opensystemslab/planx-core/types";

// TODO: move this type to planx-core
// also defined in editor.planx.uk/src/pages/FlowEditor/lib/store/navigation.ts
export enum SectionStatus {
  NeedsUpdated = "NEW INFORMATION NEEDED",
  ReadyToContinue = "READY TO CONTINUE",
  Started = "STARTED",
  ReadyToStart = "READY TO START",
  NotStarted = "CANNOT START YET",
  Completed = "COMPLETED",
}

test.describe("Sections", () => {
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

  test.describe("a straight-through journey", () => {
    test("not started, ready to start and complete statuses", async ({
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
            status: SectionStatus.ReadyToStart,
          },
          {
            title: "Section Two",
            status: SectionStatus.NotStarted,
          },
          {
            title: "Section Three",
            status: SectionStatus.NotStarted,
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
            status: SectionStatus.Completed,
          },
          {
            title: "Section Two",
            status: SectionStatus.ReadyToStart,
          },
          {
            title: "Section Three",
            status: SectionStatus.NotStarted,
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
            status: SectionStatus.Completed,
          },
          {
            title: "Section Two",
            status: SectionStatus.Completed,
          },
          {
            title: "Section Three",
            status: SectionStatus.ReadyToStart,
          },
        ],
      });
      await clickContinue({ page });

      // send
      await clickContinue({ page });

      await expectConfirmation({ page, text: "Application Sent" });
    });

    test("started and ready to continue", async ({ page }) => {
      await page.goto(previewURL);
      await page.evaluate('featureFlags.toggle("NAVIGATION_UI")');

      await fillInEmail({ page, context });
      await clickContinue({ page, waitForResponse: true });

      await expectSections({
        page,
        sections: [
          {
            title: "Section One",
            status: SectionStatus.ReadyToStart,
          },
          {
            title: "Section Two",
            status: SectionStatus.NotStarted,
          },
          {
            title: "Section Three",
            status: SectionStatus.NotStarted,
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
            status: SectionStatus.Completed,
          },
          {
            title: "Section Two",
            status: SectionStatus.ReadyToStart,
          },
          {
            title: "Section Three",
            status: SectionStatus.NotStarted,
          },
        ],
      });
      await clickContinue({ page });

      await answerQuestion({ page, title: "Question 2", answer: "A" });
      await clickContinue({ page });

      // back to Question 2
      await clickBack({ page });

      // back to Section Two Overview
      await clickBack({ page });

      await expectSections({
        page,
        sections: [
          {
            title: "Section One",
            status: SectionStatus.Completed,
          },
          {
            title: "Section Two",
            status: SectionStatus.ReadyToContinue,
          },
          {
            title: "Section Three",
            status: SectionStatus.NotStarted,
          },
        ],
      });
      await clickContinue({ page });

      // skip Question 2
      await clickContinue({ page });

      // skip end of section 2 notice
      await clickContinue({ page });

      await expectSections({
        page,
        sections: [
          {
            title: "Section One",
            status: SectionStatus.Completed,
          },
          {
            title: "Section Two",
            status: SectionStatus.Completed,
          },
          {
            title: "Section Three",
            status: SectionStatus.ReadyToStart,
          },
        ],
      });
      await clickContinue({ page });

      // back to Section Three Overview
      await clickBack({ page });

      // back to end of section 2 notice
      await clickBack({ page });

      // back to Question 2
      await clickBack({ page });

      // back to Section Two Overview
      await clickBack({ page });

      await expectSections({
        page,
        sections: [
          {
            title: "Section One",
            status: SectionStatus.Completed,
          },
          {
            title: "Section Two",
            status: SectionStatus.ReadyToContinue,
          },
          {
            title: "Section Three",
            status: SectionStatus.Started,
          },
        ],
      });

      // back to Question 1
      await clickBack({ page });

      // back to Section One Overview
      await clickBack({ page });

      await expectSections({
        page,
        sections: [
          {
            title: "Section One",
            status: SectionStatus.ReadyToContinue,
          },
          {
            title: "Section Two",
            status: SectionStatus.Started,
          },
          {
            title: "Section Three",
            status: SectionStatus.Started,
          },
        ],
      });
    });
  });

  test.describe("simple save and return", () => {
    test("not started, ready to start and complete statuses", async ({
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
            status: SectionStatus.ReadyToStart,
          },
          {
            title: "Section Two",
            status: SectionStatus.NotStarted,
          },
          {
            title: "Section Three",
            status: SectionStatus.NotStarted,
          },
        ],
      });
      await clickContinue({ page });

      await answerQuestion({ page, title: "Question 1", answer: "A" });
      await clickContinue({ page });

      const sectionsBeforeSaveAndReturn = [
        {
          title: "Section One",
          status: SectionStatus.Completed,
        },
        {
          title: "Section Two",
          status: SectionStatus.ReadyToStart,
        },
        {
          title: "Section Three",
          status: SectionStatus.NotStarted,
        },
      ];
      await expectSections({
        page,
        sections: sectionsBeforeSaveAndReturn,
      });

      const sessionId = await saveSession({ page, context });
      if (!sessionId) test.fail();

      await returnToSession({ page, context, sessionId: sessionId! });

      // sections should have not changed
      await expectSections({
        page,
        sections: sectionsBeforeSaveAndReturn,
      });
    });

    test("the ready to continue status", async ({ page }) => {
      await page.goto(previewURL);
      await page.evaluate('featureFlags.toggle("NAVIGATION_UI")');

      await fillInEmail({ page, context });
      await clickContinue({ page });

      await expectSections({
        page,
        sections: [
          {
            title: "Section One",
            status: SectionStatus.ReadyToStart,
          },
          {
            title: "Section Two",
            status: SectionStatus.NotStarted,
          },
          {
            title: "Section Three",
            status: SectionStatus.NotStarted,
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
            status: SectionStatus.Completed,
          },
          {
            title: "Section Two",
            status: SectionStatus.ReadyToStart,
          },
          {
            title: "Section Three",
            status: SectionStatus.NotStarted,
          },
        ],
      });
      await clickContinue({ page });

      await answerQuestion({ page, title: "Question 2", answer: "B" });
      await clickContinue({ page });

      const sessionId = await saveSession({ page, context });
      if (!sessionId) test.fail();

      await returnToSession({ page, context, sessionId: sessionId! });

      await expectSections({
        page,
        sections: [
          {
            title: "Section One",
            status: SectionStatus.Completed,
          },
          {
            title: "Section Two",
            status: SectionStatus.ReadyToContinue,
          },
          {
            title: "Section Three",
            status: SectionStatus.NotStarted,
          },
        ],
      });
    });
  });

  test.describe("save and return with service changes (reconciliation)", () => {
    test("needs new information and started", async ({ page }) => {
      await page.goto(previewURL);
      await page.evaluate('featureFlags.toggle("NAVIGATION_UI")');

      await fillInEmail({ page, context });
      await clickContinue({ page });

      await expectSections({
        page,
        sections: [
          {
            title: "Section One",
            status: SectionStatus.ReadyToStart,
          },
          {
            title: "Section Two",
            status: SectionStatus.NotStarted,
          },
          {
            title: "Section Three",
            status: SectionStatus.NotStarted,
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
            status: SectionStatus.Completed,
          },
          {
            title: "Section Two",
            status: SectionStatus.ReadyToStart,
          },
          {
            title: "Section Three",
            status: SectionStatus.NotStarted,
          },
        ],
      });
      await clickContinue({ page });

      await answerQuestion({ page, title: "Question 2", answer: "B" });
      await clickContinue({ page });

      const sessionId = await saveSession({ page, context });
      if (!sessionId) test.fail();

      // modify section
      await modifyFlow({
        context,
        flowData: {
          ...flow,
          ...updatedQuestionAnswers,
        },
      });

      await returnToSession({ page, context, sessionId: sessionId! });

      await expectSections({
        page,
        sections: [
          {
            title: "Section One",
            status: SectionStatus.NeedsUpdated,
          },
          {
            title: "Section Two",
            status: SectionStatus.Started,
          },
          {
            title: "Section Three",
            status: SectionStatus.NotStarted,
          },
        ],
      });
    });
  });
});

async function modifyFlow({
  context,
  flowData,
}: {
  context: Context;
  flowData: FlowGraph;
}) {
  const adminGQLClient = getGraphQLClient();
  if (!context.flow?.id || !context.user?.id) {
    throw new Error("context must have a flow and user");
  }
  await adminGQLClient.request(
    gql`
      mutation UpdateTestFlow($flowId: uuid!, $userId: Int!, $data: jsonb!) {
        update_flows_by_pk(pk_columns: { id: $flowId }, _set: { data: $data }) {
          id
          data
        }
        insert_published_flows_one(
          object: { flow_id: $flowId, data: $data, publisher_id: $userId }
        ) {
          id
        }
      }
    `,
    {
      flowId: context.flow!.id,
      userId: context.user!.id,
      data: flowData,
    }
  );
}
