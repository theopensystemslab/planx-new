const supertest = require("supertest");
const app = require("../server");
const { queryMock } = require("../tests/graphqlQueryMock");
const { mockFlow, mockLowcalSession } = require("../tests/mocks/saveAndReturnMocks");

// https://docs.notifications.service.gov.uk/node.html#email-addresses
const TEST_EMAIL = "simulate-delivered@notifications.service.gov.uk"
const ENDPOINT = "/send-email"

describe("Send Email endpoint", () => {
  beforeEach(() => {
    queryMock.reset();
  });

  it("throws an error if required data is missing", () => {

    const missingEmail = { sessionId: 123, template: "save" };
    const missingSessionId = { email: "test", template: "save" };
    const missingTemplate = { email: "test", sessionId: 123 };

    [missingEmail, missingSessionId, missingTemplate].forEach(async (invalidBody) => {
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

    const payload = { sessionId: 123, email: TEST_EMAIL, template: "save" };
    
    await supertest(app)
      .post(ENDPOINT)
      .send(payload)
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

    const payload = { sessionId: 123, email: "Not an email address", template: "save" };

    await supertest(app)
      .post(ENDPOINT)
      .send(payload)
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

    const payload = { sessionId: 123, email: TEST_EMAIL, template: "not a template" };

    await supertest(app)
      .post(ENDPOINT)
      .send(payload)
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

    const payload = { sessionId: 123, email: TEST_EMAIL, template: "save" };

    await supertest(app)
      .post(ENDPOINT)
      .send(payload)
      .expect(500)
      .then(response => {
        expect(response.body).toHaveProperty("error", "Unable to validate request");
      });
  });

});