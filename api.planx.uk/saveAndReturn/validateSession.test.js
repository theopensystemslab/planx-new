const supertest = require("supertest");
const app = require("../server");
const { queryMock } = require("../tests/graphqlQueryMock");
const { mockFlow, mockLowcalSession } = require("../tests/mocks/saveAndReturnMocks");

// https://docs.notifications.service.gov.uk/node.html#email-addresses
const TEST_EMAIL = "simulate-delivered@notifications.service.gov.uk"
const ENDPOINT = "/validate-session";

describe("Validate Session endpoint", () => {

  it("throws an error if required data is missing", () => {
    const missingEmail = { sessionId: 123 };
    const missingSessionId = { email: "test" };

    [missingEmail, missingSessionId].forEach(async (invalidBody) => {
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
    const payload = { email: TEST_EMAIL, sessionId: 123 };

    queryMock.mockQuery({
      name: 'ValidateRequest',
      data: { flows_by_pk: mockFlow, lowcal_sessions: [mockLowcalSession] },
      variables: payload,
    });

    await supertest(app)
      .post(ENDPOINT)
      .send(payload)
      .expect(200);
  });

  it("Returns a 404 NOT FOUND for an invalid session", async () => {
    const payload = { email: TEST_EMAIL, sessionId: 123 };

    queryMock.mockQuery({
      name: 'ValidateRequest',
      data: { flows_by_pk: mockFlow, lowcal_sessions: [] },
      variables: payload,
    });

    await supertest(app)
      .post(ENDPOINT)
      .send(payload)
      .expect(404);
  });
});