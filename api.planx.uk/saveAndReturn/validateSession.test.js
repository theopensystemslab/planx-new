const supertest = require("supertest");
const app = require("../server");
const { queryMock } = require("../tests/graphqlQueryMock");
const { mockFlow, mockLowcalSession } = require("../tests/mocks/saveAndReturnMocks");

// https://docs.notifications.service.gov.uk/node.html#email-addresses
const TEST_EMAIL = "simulate-delivered@notifications.service.gov.uk"
const ENDPOINT = "/validate-session";

describe("Validate Session endpoint", () => {

  it("throws an error if required data is missing", () => {
<<<<<<< HEAD
    const missingEmail = { flowId: "test", sessionId: 123 };
    const missingSessionId = { flowId: "test", email: "test" };
    const missingFlowId = { email: "test", sessionId: 123 };

    [missingEmail, missingSessionId, missingFlowId].forEach(async (invalidBody) => {
=======
    const missingEmail = { sessionId: 123 };
    const missingSessionId = { email: "test" };

    [missingEmail, missingSessionId].forEach(async (invalidBody) => {
>>>>>>> 72c0362dd746b73a2bb16c2aa3d111a32dca1e8a
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
<<<<<<< HEAD
    const flowId = 123;
    const sessionId = 456;
=======
    const payload = { email: TEST_EMAIL, sessionId: 123 };
>>>>>>> 72c0362dd746b73a2bb16c2aa3d111a32dca1e8a

    queryMock.mockQuery({
      name: 'ValidateRequest',
      data: { flows_by_pk: mockFlow, lowcal_sessions: [mockLowcalSession] },
<<<<<<< HEAD
      variables: { email: TEST_EMAIL, flowId, sessionId}
=======
      variables: payload,
>>>>>>> 72c0362dd746b73a2bb16c2aa3d111a32dca1e8a
    });

    await supertest(app)
      .post(ENDPOINT)
<<<<<<< HEAD
      .send({ email: TEST_EMAIL, flowId, sessionId })
=======
      .send(payload)
>>>>>>> 72c0362dd746b73a2bb16c2aa3d111a32dca1e8a
      .expect(200);
  });

  it("Returns a 404 NOT FOUND for an invalid session", async () => {
<<<<<<< HEAD
    const flowId = 123;
    const sessionId = 456;
=======
    const payload = { email: TEST_EMAIL, sessionId: 123 };
>>>>>>> 72c0362dd746b73a2bb16c2aa3d111a32dca1e8a

    queryMock.mockQuery({
      name: 'ValidateRequest',
      data: { flows_by_pk: mockFlow, lowcal_sessions: [] },
<<<<<<< HEAD
      variables: { email: TEST_EMAIL, flowId, sessionId}
=======
      variables: payload,
>>>>>>> 72c0362dd746b73a2bb16c2aa3d111a32dca1e8a
    });

    await supertest(app)
      .post(ENDPOINT)
<<<<<<< HEAD
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

=======
      .send(payload)
      .expect(404);
  });
>>>>>>> 72c0362dd746b73a2bb16c2aa3d111a32dca1e8a
});