const supertest = require("supertest");
const app = require("../server");
const { queryMock } = require("../tests/graphqlQueryMock");
const { mockFlow, mockLowcalSession } = require("../tests/mocks/saveAndReturnMocks");

// https://docs.notifications.service.gov.uk/node.html#email-addresses
const TEST_EMAIL = "simulate-delivered@notifications.service.gov.uk"

describe("Send Email endpoint", () => {
  beforeEach(() => {
    queryMock.reset();
    queryMock.mockQuery({
      name: "GetHumanReadableProjectType",
      data: {
        project_types: [
          { description: "New office premises" }
        ],
      },
      variables: {
        rawList: ["new.office"],
      }
    });

    queryMock.mockQuery({
      name: "ValidateSingleSessionRequest",
      data: {
        flows_by_pk: mockFlow,
        lowcal_sessions: [mockLowcalSession]
      }
    });

    queryMock.mockQuery({
      name: "SoftDeleteLowcalSession",
      data: {
        update_lowcal_sessions_by_pk: { id:  123 }
      },
      variables: {
        sessionId: 123,
      }
    });
  });

  describe("'Save' template", () => {
    const SAVE_ENDPOINT = "/send-email/save"
    
    it("throws an error if required data is missing", async () => {
      const missingEmail = { payload: { sessionId: 123 } };
      const missingSessionId = { payload: { email: "test" } };
  
      for (let invalidBody of [missingEmail, missingSessionId]) {
        await supertest(app)
          .post(SAVE_ENDPOINT)
          .send(invalidBody)
          .expect(400)
          .then(response => {
            expect(response.body).toHaveProperty("error", "Required value missing");
          });
      }
    });
  
    it("sends a Notify email on successful save", async () => {
  
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
  
      const data = { payload: { sessionId: 123, email: "Not an email address" } };
  
      await supertest(app)
        .post(SAVE_ENDPOINT)
        .send(data)
        .expect(500)
        .then((response) => {
          expect(response.body).toHaveProperty("error");
        });
    });

    it("throws an error if a sessionId is invalid", async () => {
      queryMock.reset();
      // Reset mocks to get unique response for ValidateSingleSessionRequest
      queryMock.mockQuery({
        name: "ValidateSingleSessionRequest",
        data: {
          flows_by_pk: mockFlow,
          lowcal_sessions: []
        }
      });
  
      queryMock.mockQuery({
        name: "GetHumanReadableProjectType",
        data: {
          project_types: [
            { description: "New office premises" }
          ],
        },
        variables: {
          rawList: ["new.office"],
        }
      });
  
      queryMock.mockQuery({
        name: "SoftDeleteLowcalSession",
        data: {
          update_lowcal_sessions_by_pk: { id:  123 }
        },
        variables: {
          sessionId: 123,
        }
      });
  
      const data = { payload: { sessionId: 123, email: TEST_EMAIL } };
  
      await supertest(app)
        .post(SAVE_ENDPOINT)
        .send(data)
        .expect(500)
        .then(response => {
          expect(response.body).toHaveProperty("error");
        });
    });
  });

  describe("Invalid template", () => {
    it("throws an error if the template is missing", async () => {
      const data = { payload: { sessionId: 123, email: TEST_EMAIL } };
      await supertest(app)
        .post("/send-email")
        .send(data)
        .expect(404);
    });

    it("throws an error if a template is invalid", async () => {
      const data = { payload: { sessionId: 123, email: TEST_EMAIL } };
  
      await supertest(app)
        .post("/send-email/not-a-template")
        .send(data)
        .expect(400)
        .then(response => {
          expect(response.body).toHaveProperty("error", 'Invalid template - must be one of [save, reminder, expiry]');
        });
    });
  });

  describe("Templates which require authorisation", () => {
    it("returns 401 UNAUTHORIZED if no auth header is provided", async () => {
      for (let template of ["reminder", "expiry"]) {
        const data = { payload: { sessionId: 123, email: TEST_EMAIL } };
        await supertest(app)
          .post(`/send-email/${template}`)
          .send(data)
          .expect(401);
      }
    });
  
    it("returns 401 UNAUTHORIZED if no incorrect auth header is provided", async () => {
      for (let template of ["reminder", "expiry"]) {
        const data = { payload: { sessionId: 123, email: TEST_EMAIL } };
        await supertest(app)
          .post(`/send-email/${template}`)
          .set("Authorization", "invalid-api-key")
          .send(data)
          .expect(401);
      };
    });
  
    it("returns 200 OK if the correct headers are used", async () => {
      for (let template of ["reminder", "expiry"]) {
        const data = { payload: { sessionId: 123, email: TEST_EMAIL } };
        await supertest(app)
          .post(`/send-email/${template}`)
          .set("Authorization", "testtesttest")
          .send(data)
          .expect(200);
      };
    });
  });

  describe("'Expiry' template", () => {
    it("soft deletes the session when an expiry email is sent", async () => {
    
      const data = { payload: { sessionId: 123, email: TEST_EMAIL } };

      await supertest(app)
        .post(`/send-email/expiry`)
        .set("Authorization", "testtesttest")
        .send(data)
        .expect(200);

      const softDeleteSessionMock = queryMock.getCalls().find(mock => mock.id === "SoftDeleteLowcalSession");
      expect(softDeleteSessionMock.response.errors).toBeUndefined();
      expect(softDeleteSessionMock.response.data.update_lowcal_sessions_by_pk.id).toEqual(123);
    });
  });
});