import supertest from "supertest";
import omit from "lodash.omit";
import app from "../server";
import { queryMock } from "../tests/graphqlQueryMock";
import {
  mockFlow,
  mockLowcalSession,
  mockFindSession,
  mockNotFoundSession,
  mockGetFlowDiff,
  mockGetMostRecentPublishedFlow,
  stubInsertReconciliationRequests,
  stubUpdateLowcalSessionData,
} from "../tests/mocks/saveAndReturnMocks";
import type { Node, Flow, Breadcrumb } from "../types";

const validateSessionPath = "/validate-session";

describe("Validate Session endpoint", () => {
  const reconciledData = omit(mockLowcalSession.data, "passport");

  afterEach(() => {
    queryMock.reset();
  });

  it("throws an error if required data is missing", async () => {
    queryMock.mockQuery(mockFindSession());

    const missingEmail = {
      payload: { sessionId: mockLowcalSession.id },
    };
    const missingSessionId = { payload: { email: mockLowcalSession.email } };

    for (const invalidBody of [missingEmail, missingSessionId]) {
      await supertest(app)
        .post(validateSessionPath)
        .send(invalidBody)
        .expect(400)
        .then((response) => {
          expect(response.body).toHaveProperty(
            "error",
            "Required value missing"
          );
        });
    }
  });

  it("returns a 404 NOT FOUND if the session is not found", async () => {
    queryMock.mockQuery(mockNotFoundSession);

    const data = {
      payload: {
        sessionId: "not-found-id",
        email: mockLowcalSession.email,
      },
    };
    await supertest(app)
      .post(validateSessionPath)
      .send(data)
      .expect(404)
      .then((response) => {
        expect(response.body).toHaveProperty(
          "error",
          "Unable to find your session"
        );
      });
  });

  it("returns a 200 OK for a valid session where there have been no updates", async () => {
    mockQueryWithFlowDiff({ flow: mockFlow.data, diff: null });

    const data = {
      payload: {
        sessionId: mockLowcalSession.id,
        email: mockLowcalSession.email,
      },
    };

    const expected = {
      message: "No content changes since last save point",
      changesFound: false,
      reconciledSessionData: reconciledData,
    };

    await supertest(app)
      .post(validateSessionPath)
      .send(data)
      .expect(200)
      .then((response) => {
        expect(response.body).toEqual(expected);
      });
  });

  test("an updated flow without sections", async () => {
    const flow: Flow["data"] = {
      _root: {
        edges: ["question"],
      },
      question: {
        data: { fn: "question", text: "Is it '1' or '2'" },
        edges: ["one", "two"],
        type: 100,
      },
      one: {
        data: { val: "answer1", text: "1" },
        type: 200,
      },
      two: {
        data: { val: "answer2", text: "2" },
        type: 200,
      },
    };

    const diff = {
      question: {
        data: { fn: "question", text: "Is it '1' or '2'" },
        edges: ["one", "two"],
        type: 100,
      },
      one: { data: { text: "1", val: "answer1" }, type: 200 },
      two: { data: { text: "2", val: "answer2" }, type: 200 },
    };

    mockQueryWithFlowDiff({ flow, diff });

    const data = {
      payload: {
        sessionId: mockLowcalSession.id,
        email: mockLowcalSession.email,
      },
    };

    const expected = {
      reconciledSessionData: reconciledData,
      message:
        "This service has been updated since you last saved your application. We will ask you to answer any updated questions again when you continue.",
      alteredSectionIds: [],
      changesFound: true,
    };

    await supertest(app)
      .post(validateSessionPath)
      .send(data)
      .expect(200)
      .then((response) => {
        expect(response.body).toEqual(expected);
      });
  });

  test("an updated flow with modified answers but not questions", async () => {
    const flow: Flow["data"] = {
      _root: {
        edges: ["question1", "question2"],
      },
      question1: {
        data: { fn: "question", text: "Is it 'one' or 'two'" },
        type: 100,
        edges: ["one", "two"],
      },
      question2: {
        data: { fn: "question", text: "Is it 'A' or 'B'" },
        type: 100,
        edges: ["a", "b"],
      },
      one: {
        data: { val: "answer1", text: "One (1)" },
        type: 200,
      },
      two: {
        data: { val: "answer2", text: "Two (2)" },
        type: 200,
      },
      a: {
        data: { val: "answerA", text: "A" },
        type: 200,
      },
      b: {
        data: { val: "answerB", text: "B or Other" },
        type: 200,
      },
    };

    const breadcrumbs: Breadcrumb = {
      question1: {
        auto: false,
        answers: ["two"],
      },
      question2: {
        auto: false,
        answers: ["b"],
      },
    };

    const diff = {
      one: {
        data: { val: "answer1", text: "One (1)" },
        type: 200,
      },
      two: {
        data: { val: "answer2", text: "Two (2)" },
        type: 200,
      },
    };

    mockQueryWithFlowDiff({ flow, diff, breadcrumbs });

    const data = {
      payload: {
        sessionId: mockLowcalSession.id,
        email: mockLowcalSession.email,
      },
    };

    const expected = {
      reconciledSessionData: {
        ...reconciledData,
        breadcrumbs: {
          question2: {
            auto: false,
            answers: ["b"],
          },
        },
      },
      message:
        "This service has been updated since you last saved your application. We will ask you to answer any updated questions again when you continue.",
      alteredSectionIds: [],
      changesFound: true,
    };

    const removedBreadcrumbIds = ["question1"];

    await supertest(app)
      .post(validateSessionPath)
      .send(data)
      .expect(200)
      .then((response) => {
        expect(response.body).toEqual(expected);
        expect(
          objectContainsKeys(
            response.body.reconciledSessionData.breadcrumbs,
            removedBreadcrumbIds
          )
        ).toBe(false);
      });
  });

  test("an updated flow with modified answers but not questions where the flow has sections", async () => {
    const flow: Flow["data"] = {
      _root: {
        edges: ["section1", "question1", "question2", "section2", "question3"],
      },
      section1: {
        data: {
          title: "Section One",
        },
        type: 360,
      },
      question1: {
        data: { fn: "question", text: 'Is it "One" or "Two"' },
        type: 100,
        edges: ["one", "two"],
      },
      one: {
        data: { val: "answer1", text: "One" },
        type: 200,
      },
      two: {
        data: { val: "answer2", text: "Two" },
        type: 200,
      },
      question2: {
        data: { fn: "question", text: '"Yes" or "No"' },
        type: 100,
        edges: ["yes", "no"],
      },
      yes: {
        data: { val: "answerYes", text: "Yes" },
        type: 200,
      },
      no: {
        data: { val: "answerNo", text: "No" },
        type: 200,
      },
      section2: {
        data: {
          title: "Section Two",
        },
        type: 360,
      },
      question3: {
        data: { fn: "question", text: "Is it 'A' or 'B'" },
        type: 100,
        edges: ["a", "b"],
      },
      a: {
        data: { val: "answerA", text: "A" },
        type: 200,
      },
      b: {
        data: { val: "answerB", text: "B" },
        type: 200,
      },
    };

    const breadcrumbs: Breadcrumb = {
      section1: {
        auto: false,
      },
      question1: {
        auto: false,
        answers: ["two"],
      },
      question2: {
        auto: false,
        answers: ["no"],
      },
      section2: {
        auto: false,
      },
      question3: {
        auto: false,
        answers: ["b"],
      },
    };

    const diff = {
      question1: {
        data: { fn: "question", text: 'Is it "One" or "Two"' },
        type: 100,
        edges: ["one", "two"],
      },
      question2: {
        data: { fn: "question", text: '"Yes" or "No"' },
        type: 100,
        edges: ["yes", "no"],
      },
    };

    mockQueryWithFlowDiff({ flow, diff, breadcrumbs });

    const data = {
      payload: {
        sessionId: mockLowcalSession.id,
        email: mockLowcalSession.email,
      },
    };

    const expected = {
      reconciledSessionData: {
        ...reconciledData,
        breadcrumbs: {
          section2: {
            auto: false,
          },
          question3: {
            auto: false,
            answers: ["b"],
          },
        },
      },
      message:
        "This service has been updated since you last saved your application. We will ask you to answer any updated questions again when you continue.",
      alteredSectionIds: ["section1"],
      changesFound: true,
    };

    const removedBreadcrumbIds = ["question1", "section1", "question2"];

    await supertest(app)
      .post(validateSessionPath)
      .send(data)
      .expect(200)
      .then((response) => {
        expect(response.body).toEqual(expected);
        expect(
          objectContainsKeys(
            response.body.reconciledSessionData.breadcrumbs,
            removedBreadcrumbIds
          )
        ).toBe(false);
      });
  });

  test("an updated flow without sections where sections are added", async () => {
    const flow: Flow["data"] = {
      _root: {
        edges: ["section1", "question1", "section2", "question2"],
      },
      section1: {
        data: {
          title: "Section One",
        },
        type: 360,
      },
      question1: {
        data: { fn: "question", text: "Is it 'one' or 'two'" },
        type: 100,
        edges: ["one", "two"],
      },
      one: {
        data: { val: "answer", text: "One" },
        type: 200,
      },
      two: {
        data: { val: "answer", text: "Two" },
        type: 200,
      },
      section2: {
        data: {
          title: "Section Two",
        },
        type: 360,
      },
      question2: {
        data: { fn: "question", text: "Is it 'A' or 'B'" },
        type: 100,
        edges: ["a", "b"],
      },
      a: {
        data: { val: "answer", text: "A" },
        type: 200,
      },
      b: {
        data: { val: "answer", text: "B" },
        type: 200,
      },
    };

    const breadcrumbs: Breadcrumb = {
      question1: {
        auto: false,
        answers: ["two"],
      },
      question2: {
        auto: false,
        answers: ["b"],
      },
    };

    const diff = {
      _root: {
        edges: ["section1", "question1", "section2", "question2"],
      },
      section1: {
        data: {
          title: "Section One",
        },
        type: 360,
      },
      section2: {
        data: {
          title: "Section Two",
        },
        type: 360,
      },
    };

    mockQueryWithFlowDiff({ flow, diff, breadcrumbs });

    const data = {
      payload: {
        sessionId: mockLowcalSession.id,
        email: mockLowcalSession.email,
      },
    };

    const expected = {
      reconciledSessionData: {
        ...reconciledData,
        breadcrumbs,
      },
      message:
        "This service has been updated since you last saved your application. We will ask you to answer any updated questions again when you continue.",
      alteredSectionIds: [],
      changesFound: true,
    };

    await supertest(app)
      .post(validateSessionPath)
      .send(data)
      .expect(200)
      .then((response) => {
        expect(response.body).toEqual(expected);
        expect(
          objectContainsKeys(
            response.body.reconciledSessionData.breadcrumbs,
            []
          )
        ).toBe(false);
      });
  });

  test('auto-answered breadcrumbs with matching "data.val" values are also removed', async () => {
    const flow: Flow["data"] = {
      _root: {
        edges: ["question1", "question2"],
      },
      question1: {
        data: { fn: "question", text: "Is it 'X' or 'Y'" },
        type: 100,
        edges: ["one", "two"],
      },
      question2: {
        data: { fn: "question", text: "Is it 'X' or 'Y'" },
        type: 100,
        edges: ["a", "b"],
      },
      one: {
        data: { val: "question.x", text: "1: X" },
        type: 200,
      },
      two: {
        data: { val: "question.y", text: "2: Y" },
        type: 200,
      },
      a: {
        data: { val: "question.x", text: "A: X" },
        type: 200,
      },
      b: {
        data: { val: "question.y", text: "B: Y" },
        type: 200,
      },
    };

    const breadcrumbs: Breadcrumb = {
      question1: {
        auto: false,
        answers: ["two"],
      },
      question2: {
        auto: true,
        answers: ["b"],
      },
    };

    // a change to answer "two" means that "question1" should be removed
    // but it also means that the auto-answered "question2" should be removed
    // because the question's answer "b" shares the same "val"
    const diff = {
      two: {
        data: { val: "question.y", text: "2: YYY" },
        type: 200,
      },
    };

    mockQueryWithFlowDiff({ flow, diff, breadcrumbs });

    const data = {
      payload: {
        sessionId: mockLowcalSession.id,
        email: mockLowcalSession.email,
      },
    };

    const expected = {
      reconciledSessionData: {
        ...reconciledData,
        breadcrumbs: {},
      },
      message:
        "This service has been updated since you last saved your application. We will ask you to answer any updated questions again when you continue.",
      alteredSectionIds: [],
      changesFound: true,
    };

    const removedBreadcrumbIds = ["question1", "question2"];

    await supertest(app)
      .post(validateSessionPath)
      .send(data)
      .expect(200)
      .then((response) => {
        expect(response.body).toEqual(expected);
        expect(
          objectContainsKeys(
            response.body.reconciledSessionData.breadcrumbs,
            removedBreadcrumbIds
          )
        ).toBe(false);
      });
  });
});

function mockQueryWithFlowDiff({
  flow,
  diff,
  breadcrumbs,
}: {
  flow: Flow["data"];
  diff: { [key: string]: Node } | null;
  breadcrumbs?: Breadcrumb;
}) {
  queryMock.mockQuery(mockGetFlowDiff(diff));
  queryMock.mockQuery(mockGetMostRecentPublishedFlow(flow));
  queryMock.mockQuery(mockFindSession(breadcrumbs));
  queryMock.mockQuery(stubInsertReconciliationRequests);
  queryMock.mockQuery(stubUpdateLowcalSessionData);
}

function objectContainsKeys(object: object, keys: string[]): boolean {
  return Object.keys(object).some((key) => keys.includes(key));
}
