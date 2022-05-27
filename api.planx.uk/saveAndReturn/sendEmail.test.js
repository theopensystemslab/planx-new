const supertest = require("supertest");
const app = require("../server");
const { queryMock } = require("../tests/graphqlQueryMock");
const { mockFlow, mockLowcalSession } = require("../tests/mocks/saveAndReturnMocks");

// https://docs.notifications.service.gov.uk/node.html#email-addresses
const TEST_EMAIL = "simulate-delivered@notifications.service.gov.uk"
const SAVE_ENDPOINT = "/send-email/save"

describe("Send Email endpoint", () => {
  beforeEach(() => {
    queryMock.reset();
  });

  it("throws an error if required data is missing", () => {

    const missingEmail = { payload: { sessionId: 123 } };
    const missingSessionId = { payload: { email: "test" } };
    const missingTemplate = { payload: { email: "test" } };

    [missingEmail, missingSessionId, missingTemplate].forEach(async (invalidBody) => {
      await supertest(app)
      .post(SAVE_ENDPOINT)
      .send(invalidBody)
      .expect(400)
      .then(response => {
        expect(response.body).toHaveProperty("error", "Required value missing");
      });
    })

  });

  it("sends a Notify email on successful save", async () => {
    
    queryMock.mockQuery({
      name: 'ValidateSingleSessionRequest',
      data: {
        flows_by_pk: mockFlow,
        lowcal_sessions: [mockLowcalSession]
      },
      variables: {
        sessionId: 123,
        email: TEST_EMAIL
      }
    });

    const data = { payload: { sessionId: 123, email: TEST_EMAIL } };
    
    await supertest(app)
      .post(SAVE_ENDPOINT)
      .send(data)
      .expect(200)
      .then((response) => {
        expect(response.body).toHaveProperty("expiryDate");
      });
  });

  it("throws an error for an invalid email address", async () => {
    queryMock.mockQuery({
      name: 'ValidateSingleSessionRequest',
      data: {
        flows_by_pk: mockFlow,
        lowcal_sessions: [mockLowcalSession]
      },
      variables: {
        sessionId: 123,
        email: "not an email address"
      }
    });

    const data = { payload: { sessionId: 123, email: "Not an email address" } };

    await supertest(app)
      .post(SAVE_ENDPOINT)
      .send(data)
      .expect(400)
      .then((response) => {
        expect(response.body).toHaveProperty("errors");
      });
  });

  it("throws an error if a template is invalid", async () => {
    queryMock.mockQuery({
      name: 'ValidateSingleSessionRequest',
      data: {
        flows_by_pk: null,
        lowcal_sessions: [mockLowcalSession]
      },
      variables: {
        sessionId: 123,
        email: TEST_EMAIL,
      }
    });

    const data = { payload: { sessionId: 123, email: TEST_EMAIL } };

    await supertest(app)
      .post("/send-email/not-a-template")
      .send(data)
      .expect(400)
      .then(response => {
        expect(response.body).toHaveProperty("error", 'Invalid template - must be one of [save, reminder, expiry]');
      });
  });

  it("throws an error if a sessionId is invalid", async () => {
    queryMock.mockQuery({
      name: 'ValidateSingleSessionRequest',
      data: {
        flows_by_pk: mockFlow,
        lowcal_sessions: null
      },
      variables: {
        sessionId: 123,
        email: TEST_EMAIL,
      }
    });

    const data = { payload: { sessionId: 123, email: TEST_EMAIL } };

    await supertest(app)
      .post(SAVE_ENDPOINT)
      .send(data)
      .expect(500)
      .then(response => {
        expect(response.body).toHaveProperty("error", "Unable to validate request");
      });
  });
});

describe("Send Email endpoint - Templates which require authorisation", () => {

  it("returns 401 UNAUTHORIZED if no auth header is provided", () => {
    ["reminder", "expiry"].forEach(async (template) => {
      const data = { payload: { sessionId: 123, email: TEST_EMAIL } };
      await supertest(app)
        .post(`/send-email/${template}`)
        .send(data)
        .expect(401);
    });
  });

  it("returns 401 UNAUTHORIZED if no incorrect auth header is provided", () => {
    ["reminder", "expiry"].forEach(async (template) => {
      const data = { payload: { sessionId: 123, email: TEST_EMAIL } };
      await supertest(app)
        .post(`/send-email/${template}`)
        .set("Authorization", "invalid-api-key")
        .send(data)
        .expect(401);
    });
  });

  it("returns 200 OK if the correct headers are used", () => {
    ["reminder", "expiry"].forEach(async (template) => {
      const data = { payload: { sessionId: 123, email: TEST_EMAIL } };
      await supertest(app)
        .post(`/send-email/${template}`)
        .set("Authorisation", "testtesttest")
        .send(data)
        .expect(401);
    });
  });
});