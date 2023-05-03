import supertest from "supertest";
import app from "../server";
import { queryMock } from "../tests/graphqlQueryMock";
import {
  mockFlow,
  mockLowcalSession,
  mockFindSession,
  mockNotFoundSession,
  mockGetMostRecentPublishedFlow,
  mockGetPublishedFlowByDate,
  stubInsertReconciliationRequests,
  stubUpdateLowcalSessionData,
} from "../tests/mocks/saveAndReturnMocks";
import type { Flow, Breadcrumb } from "../types";

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

  it("returns a 200 OK for a valid session", async () => {
    mockQueryWithFlowDiff({ oldFlow: mockFlow.data, newFlow: mockFlow.data });

    const data = {
      payload: {
        sessionId: mockLowcalSession.id,
        email: mockLowcalSession.email,
      },
    };

    const expectedMessage = "No content changes since last save point";

    await supertest(app)
      .post(validateSessionPath)
      .send(data)
      .expect(200)
      .then((response) => {
        expect(response.body).toHaveProperty("alteredNodes", null);
        expect(response.body).toHaveProperty("message", expectedMessage);
        expect(response.body).toHaveProperty("removedBreadcrumbs", null);
      });
  });

  it("returns changed nodes and invalidated breadcrumbs when the flow has been updated", async () => {
    const oldFlow: Flow["data"] = {
      _root: {
        edges: ["question"],
      },
      question: {
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
    };
    const newFlow: Flow["data"] = {
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
    mockQueryWithFlowDiff({ oldFlow, newFlow });

    const data = {
      payload: {
        sessionId: mockLowcalSession.id,
        email: mockLowcalSession.email,
      },
    };

    const expectedDiff = [
      {
        id: "question",
        data: { fn: "question", text: "Is it '1' or '2'" },
        edges: ["one", "two"],
        type: 100,
      },
      { data: { text: "1", val: "answer" }, id: "one", type: 200 },
      { data: { text: "2", val: "answer" }, id: "two", type: 200 },
    ];

    const expectedMessage =
      "This service has been updated since you last saved your application. We will ask you to answer any updated questions again when you continue.";

    await supertest(app)
      .post(validateSessionPath)
      .send(data)
      .expect(200)
      .then((response) => {
        expect(response.body).toHaveProperty("alteredNodes", expectedDiff);
        expect(response.body).toHaveProperty("message", expectedMessage);
        expect(response.body).toHaveProperty("removedBreadcrumbs", {});
      });
  });

  // TODO this may be an existing issue or it may be my misunderstanding of how this should work
  it.skip("returns changed nodes and invalidated breadcrumbs when a flow has updated only nested nodes (answers but not questions)", async () => {
    const oldFlow: Flow["data"] = {
      _root: {
        edges: ["question1", "question2"],
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
    const newFlow: Flow["data"] = {
      ...oldFlow,
      one: {
        data: { val: "answer", text: "One (1)" },
        type: 200,
      },
      two: {
        data: { val: "answer", text: "Two (2)" },
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
    mockQueryWithFlowDiff({ oldFlow, newFlow, breadcrumbs });

    const data = {
      payload: {
        sessionId: mockLowcalSession.id,
        email: mockLowcalSession.email,
      },
    };

    const expectedDiff = [
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
      {
        id: "b",
        data: { val: "answer", text: "B or Other" },
        type: 200,
      },
    ];

    const expectedMessage =
      "This service has been updated since you last saved your application. We will ask you to answer any updated questions again when you continue.";

    const expectedRemovedBreadcrumbs: Breadcrumb = {
      question1: {
        auto: false,
        answers: ["two"],
      },
      question2: {
        auto: false,
        answers: ["b"],
      },
    };

    await supertest(app)
      .post(validateSessionPath)
      .send(data)
      .expect(200)
      .then((response) => {
        expect(response.body).toHaveProperty("alteredNodes", expectedDiff);
        expect(response.body).toHaveProperty("message", expectedMessage);
        expect(response.body).toHaveProperty(
          "removedBreadcrumbs",
          expectedRemovedBreadcrumbs
        );
      });
  });

  it("returns changed nodes and invalidated breadcrumbs when a flow with sections has been updated", async () => {
    const oldFlow: Flow["data"] = {
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
      question2: {
        data: { fn: "question", text: "yes or no" },
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
    const newFlow: Flow["data"] = {
      ...oldFlow,
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
    mockQueryWithFlowDiff({ oldFlow, newFlow, breadcrumbs });

    const data = {
      payload: {
        sessionId: mockLowcalSession.id,
        email: mockLowcalSession.email,
      },
    };

    const expectedDiff = [
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
    ];

    const expectedMessage =
      "This service has been updated since you last saved your application. We will ask you to answer any updated questions again when you continue.";

    const expectedRemovedBreadcrumbs: Breadcrumb = {
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
    };

    await supertest(app)
      .post(validateSessionPath)
      .send(data)
      .expect(200)
      .then((response) => {
        expect(response.body).toHaveProperty("alteredNodes", expectedDiff);
        expect(response.body).toHaveProperty("message", expectedMessage);
        expect(response.body).toHaveProperty(
          "removedBreadcrumbs",
          expectedRemovedBreadcrumbs
        );
      });
  });

  it("returns changed nodes and invalidated breadcrumbs when a flow without sections has sections added", async () => {
    const oldFlow: Flow["data"] = {
      _root: {
        edges: ["question1", "question2"],
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
    const newFlow: Flow["data"] = {
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
    mockQueryWithFlowDiff({ oldFlow, newFlow, breadcrumbs });

    const data = {
      payload: {
        sessionId: mockLowcalSession.id,
        email: mockLowcalSession.email,
      },
    };

    const expectedDiff = [
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
    ];

    const expectedMessage =
      "This service has been updated since you last saved your application. We will ask you to answer any updated questions again when you continue.";

    const expectedRemovedBreadcrumbs: Breadcrumb = {};

    await supertest(app)
      .post(validateSessionPath)
      .send(data)
      .expect(200)
      .then((response) => {
        expect(response.body).toHaveProperty("alteredNodes", expectedDiff);
        expect(response.body).toHaveProperty("message", expectedMessage);
        expect(response.body).toHaveProperty(
          "removedBreadcrumbs",
          expectedRemovedBreadcrumbs
        );
      });
  });
});

function mockQueryWithFlowDiff({
  oldFlow,
  newFlow,
  breadcrumbs,
}: {
  oldFlow: Flow["data"];
  newFlow: Flow["data"];
  breadcrumbs?: Breadcrumb;
}) {
  queryMock.mockQuery(mockFindSession(breadcrumbs));
  queryMock.mockQuery(mockGetPublishedFlowByDate(oldFlow));
  queryMock.mockQuery(mockGetMostRecentPublishedFlow(newFlow));
  queryMock.mockQuery(stubInsertReconciliationRequests);
  queryMock.mockQuery(stubUpdateLowcalSessionData);
}
