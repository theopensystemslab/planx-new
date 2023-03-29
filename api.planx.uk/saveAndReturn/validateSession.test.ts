import supertest from "supertest";
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
    const data = {
      payload: {
        sessionId: mockLowcalSession.id,
        email: mockLowcalSession.email,
      },
    };

    const expectedSessionData = {
      ...mockLowcalSession.data,
    };

    const expectedMessage = "No content changes since last save point";

    mockQueryWithFlowDiff({ flow: mockFlow.data, diff: null });

    await supertest(app)
      .post(validateSessionPath)
      .send(data)
      .expect(200)
      .then((response) => {
        expect(response.body).toHaveProperty("message", expectedMessage);
        expect(response.body).toHaveProperty(
          "reconciledSessionData",
          expectedSessionData
        );
      });
  });

  it("returns changed nodes and invalidated breadcrumbs when the flow has been updated", async () => {
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
        data: { val: "answer", text: "1" },
        type: 200,
      },
      two: {
        data: { val: "answer", text: "2" },
        type: 200,
      },
    };

    const diff = {
      question: {
        data: { fn: "question", text: "Is it '1' or '2'" },
        edges: ["one", "two"],
        type: 100,
      },
      one: { data: { text: "1", val: "answer" }, type: 200 },
      two: { data: { text: "2", val: "answer" }, type: 200 },
    };

    mockQueryWithFlowDiff({ flow, diff });

    const data = {
      payload: {
        sessionId: mockLowcalSession.id,
        email: mockLowcalSession.email,
      },
    };

    const expected = {
      alteredNodes: [
        {
          id: "question",
          data: { fn: "question", text: "Is it '1' or '2'" },
          edges: ["one", "two"],
          type: 100,
        },
        { data: { text: "1", val: "answer" }, id: "one", type: 200 },
        { data: { text: "2", val: "answer" }, id: "two", type: 200 },
      ],
      reconciledSessionData: {
        ...mockLowcalSession.data,
      },
      message:
        "This service has been updated since you last saved your application. We will ask you to answer any updated questions again when you continue.",
      removedBreadcrumbIds: [],
    };

    await supertest(app)
      .post(validateSessionPath)
      .send(data)
      .expect(200)
      .then((response) => {
        expect(response.body).toEqual(expected);
      });
  });

  it("returns changed nodes and invalidated breadcrumbs when a flow has updated only nested nodes (answers but not questions)", async () => {
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
        data: { val: "answer", text: "One (1)" },
        type: 200,
      },
      two: {
        data: { val: "answer", text: "Two (2)" },
        type: 200,
      },
      a: {
        data: { val: "answer", text: "A" },
        type: 200,
      },
      b: {
        data: { val: "answer", text: "B or Other" },
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
        data: { val: "answer", text: "One (1)" },
        type: 200,
      },
      two: {
        data: { val: "answer", text: "Two (2)" },
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
      alteredNodes: [
        {
          id: "one",
          data: { val: "answer", text: "One (1)" },
          type: 200,
        },
        {
          id: "two",
          data: { val: "answer", text: "Two (2)" },
          type: 200,
        },
      ],
      reconciledSessionData: {
        ...mockLowcalSession.data,
        breadcrumbs: {
          question2: {
            auto: false,
            answers: ["b"],
          },
        },
      },
      message:
        "This service has been updated since you last saved your application. We will ask you to answer any updated questions again when you continue.",
      removedBreadcrumbIds: ["question1"],
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
            expected.removedBreadcrumbIds
          )
        ).toBe(false);
      });
  });

  it("returns changed nodes and invalidated breadcrumbs when a flow with sections has been updated", async () => {
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
        data: { val: "answer", text: "One" },
        type: 200,
      },
      two: {
        data: { val: "answer", text: "Two" },
        type: 200,
      },
      question2: {
        data: { fn: "question", text: '"Yes" or "No"' },
        type: 100,
        edges: ["yes", "no"],
      },
      yes: {
        data: { val: "answer", text: "Yes" },
        type: 200,
      },
      no: {
        data: { val: "answer", text: "No" },
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
        data: { val: "answer", text: "A" },
        type: 200,
      },
      b: {
        data: { val: "answer", text: "B" },
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
      alteredNodes: [
        {
          id: "question1",
          data: { fn: "question", text: 'Is it "One" or "Two"' },
          type: 100,
          edges: ["one", "two"],
        },
        {
          id: "question2",
          data: { fn: "question", text: '"Yes" or "No"' },
          type: 100,
          edges: ["yes", "no"],
        },
      ],
      reconciledSessionData: {
        ...mockLowcalSession.data,
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
      removedBreadcrumbIds: ["question1", "section1", "question2"],
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
            expected.removedBreadcrumbIds
          )
        ).toBe(false);
      });
  });

  it("returns changed nodes and invalidated breadcrumbs when a flow without sections has sections added", async () => {
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
      alteredNodes: [
        {
          id: "_root",
          edges: ["section1", "question1", "section2", "question2"],
        },
        {
          id: "section1",
          data: {
            title: "Section One",
          },
          type: 360,
        },
        {
          id: "section2",
          data: {
            title: "Section Two",
          },
          type: 360,
        },
      ],
      reconciledSessionData: {
        ...mockLowcalSession.data,
        breadcrumbs,
      },
      message:
        "This service has been updated since you last saved your application. We will ask you to answer any updated questions again when you continue.",
      removedBreadcrumbIds: [],
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
            expected.removedBreadcrumbIds
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
