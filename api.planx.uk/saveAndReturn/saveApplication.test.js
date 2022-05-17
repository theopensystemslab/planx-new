const supertest = require("supertest");
const app = require("../server");
const { queryMock } = require("../tests/graphqlQueryMock");
const { mockFlow, mockLowcalSession } = require("../tests/mocks/saveAndReturnMocks");

// https://docs.notifications.service.gov.uk/node.html#email-addresses
const TEST_EMAIL = "simulate-delivered@notifications.service.gov.uk"
const ENDPOINT = "/save-application"

describe("saveApplication endpoint", () => {
  beforeEach(() => {
    queryMock.reset();
  });

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

  it("sends a Notify email on successful save", async () => {
    const flowId = 123;
    const sessionId = 456;

    queryMock.mockQuery({
      name: 'ValidateRequest',
      data: {
        flows_by_pk: mockFlow,
        lowcal_sessions: [mockLowcalSession]
      },
      variables: {
        flowId,
        sessionId,
        email: TEST_EMAIL
      }
    });

    await supertest(app)
      .post(ENDPOINT)
      .send({
        flowId,
        sessionId,
        email: TEST_EMAIL,
      })
      .expect(200)
      .then((response) => {
        expect(response.body).toHaveProperty("expiryDate");
      });
  });

  it("throws an error for an invalid email address", async () => {
    const flowId = 123;
    const sessionId = 456

    queryMock.mockQuery({
      name: 'ValidateRequest',
      data: {
        flows_by_pk: mockFlow,
        lowcal_sessions: [mockLowcalSession]
      },
      variables: {
        flowId,
        sessionId,
        email: "not an email address"
      }
    });

    await supertest(app)
      .post(ENDPOINT)
      .send({
        email: "Not an email address",
        flowId,
        sessionId,
      })
      .expect(400)
      .then((response) => {
        expect(response.body).toHaveProperty("errors");
      });
  });

  it("throws an error if a flowId is invalid", async () => {
    const flowId = 123;
    const sessionId = 456;

    queryMock.mockQuery({
      name: 'ValidateRequest',
      data: {
        flows_by_pk: null,
        lowcal_sessions: [mockLowcalSession]
      },
      variables: {
        flowId,
        sessionId,
        email: TEST_EMAIL
      }
    });

    await supertest(app)
      .post(ENDPOINT)
      .send({ email: TEST_EMAIL, flowId, sessionId })
      .expect(500)
      .then(response => {
        expect(response.body).toHaveProperty("error", "Unable to validate request");
      });
  });

  it("throws an error if a sessionId is invalid", async () => {
    const flowId = 123;
    const sessionId = 456;

    queryMock.mockQuery({
      name: 'ValidateRequest',
      data: {
        flows_by_pk: mockFlow,
        lowcal_sessions: null
      },
      variables: {
        flowId,
        sessionId,
        email: TEST_EMAIL
      }
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