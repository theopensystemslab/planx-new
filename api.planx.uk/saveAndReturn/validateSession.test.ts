import supertest from "supertest";
import app from "../server";
import { queryMock } from "../tests/graphqlQueryMock";
import {
  mockLowcalSession,
  mockFindSession,
  mockNotFoundSession,
  mockGetMostRecentPublishedFlow,
  mockGetPublishedFlowByDate,
  stubInsertReconciliationRequests,
  stubUpdateLowcalSessionData,
} from "../tests/mocks/saveAndReturnMocks";
import type { Flow } from "../types";

const validateSessionPath = "/validate-session";

describe("Validate Session endpoint", () => {
  afterEach(() => {
    queryMock.reset();
  });

  it("throws an error if required data is missing", async () => {
    queryMock.mockQuery(mockFindSession);

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
    mockQueryWithFlowDiff({ oldFlow: {}, newFlow: {} });

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

  it("shows a diff for changed nodes", async () => {
    const oldFlow = {
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
    const newFlow = {
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
        data: { fn: "question", text: "Is it '1' or '2'" },
        edges: ["one", "two"],
        id: "question",
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
});

function mockQueryWithFlowDiff({
  oldFlow,
  newFlow,
}: {
  oldFlow: Flow["data"];
  newFlow: Flow["data"];
}) {
  queryMock.mockQuery(mockFindSession);
  queryMock.mockQuery(mockGetPublishedFlowByDate(oldFlow));
  queryMock.mockQuery(mockGetMostRecentPublishedFlow(newFlow));
  queryMock.mockQuery(stubInsertReconciliationRequests);
  queryMock.mockQuery(stubUpdateLowcalSessionData);
}
