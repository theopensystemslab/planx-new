const supertest = require("supertest");
const app = require("../server");
const { queryMock } = require("../tests/graphqlQueryMock");
const { mockFlow, mockLowcalSession } = require("../tests/mocks/saveAndReturnMocks");

// https://docs.notifications.service.gov.uk/node.html#email-addresses
const TEST_EMAIL = "simulate-delivered@notifications.service.gov.uk"
const ENDPOINT = "/validate-session";

describe("Validate Session endpoint", () => {

  it("throws an error if required data is missing", () => {
    const missingEmail = { flowId: "test", sessionId: 123 };
    const missingSessionId = { flowId: "test", email: "test" };
    const missingFlowId = { email: "test", sessionId: 123 };

    [missingEmail, missingSessionId, missingFlowId].forEach(async (invalidBody) => {
      await supertest(app)
      .post(ENDPOINT)
      .send(invalidBody)
      .expect(400)
      .then(response => {
        expect(response.body).toHaveProperty("error", "Required value missing");
      });
    })
  });

  it("Returns a 200 OK for a valid session", async () => {
    const flowId = 123;
    const sessionId = 456;

    queryMock.mockQuery({
      name: 'ValidateRequest',
      data: { flows_by_pk: mockFlow, lowcal_sessions: [mockLowcalSession] },
      variables: { email: TEST_EMAIL, flowId, sessionId}
    });

    await supertest(app)
      .post(ENDPOINT)
      .send({ email: TEST_EMAIL, flowId, sessionId })
      .expect(200);
  });

  it("Returns a 404 NOT FOUND for an invalid session", async () => {
    const flowId = 123;
    const sessionId = 456;

    queryMock.mockQuery({
      name: 'ValidateRequest',
      data: { flows_by_pk: mockFlow, lowcal_sessions: [] },
      variables: { email: TEST_EMAIL, flowId, sessionId}
    });

    await supertest(app)
      .post(ENDPOINT)
      .send({ email: TEST_EMAIL, flowId, sessionId })
      .expect(404);
  });

  it("Throws an error for an invalid flow", async () => {
    const flowId = 123;
    const sessionId = 456;

    queryMock.mockQuery({
      name: 'ValidateRequest',
      data: { flows_by_pk: null, lowcal_sessions: [mockLowcalSession] },
      variables: { email: TEST_EMAIL, flowId, sessionId}
    });

    await supertest(app)
      .post(ENDPOINT)
      .send({ email: TEST_EMAIL, flowId, sessionId })
      .expect(500)
      .then(response => {
        expect(response.body).toHaveProperty("error", "Unable to validate request");
      });
  });

});