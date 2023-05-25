import supertest from "supertest";
import app from "../server";
import { queryMock } from "../tests/graphqlQueryMock";
import {
  mockFlow,
  mockLowcalSession,
  mockSetupEmailNotifications,
  mockSoftDeleteLowcalSession,
  mockValidateSingleSessionRequest,
} from "../tests/mocks/saveAndReturnMocks";

// https://docs.notifications.service.gov.uk/node.html#email-addresses
const TEST_EMAIL = "simulate-delivered@notifications.service.gov.uk";
const SAVE_ENDPOINT = "/send-email/save";

jest.mock("@opensystemslab/planx-core", () => {
  return {
    CoreDomainClient: jest.fn().mockImplementation(() => ({
      formatRawProjectTypes: jest.fn().mockResolvedValue(["New office premises"]),
    }))
  }
});

describe("Send Email endpoint", () => {
  beforeEach(() => {
    queryMock.reset();
    queryMock.mockQuery(mockValidateSingleSessionRequest);
    queryMock.mockQuery(mockSoftDeleteLowcalSession);
    queryMock.mockQuery(mockSetupEmailNotifications);
  });

  describe("'Save' template", () => {
    it("throws an error if required data is missing", async () => {
      const missingEmail = {
        payload: { sessionId: 123 },
      };
      const missingSessionId = { payload: { email: "test" } };

      for (const invalidBody of [missingEmail, missingSessionId]) {
        await supertest(app)
          .post(SAVE_ENDPOINT)
          .send(invalidBody)
          .expect(400)
          .then((response) => {
            expect(response.body).toHaveProperty(
              "error",
              'Failed to send "save" email. Required value missing'
            );
          });
      }
    });

    it("sends a Notify email on successful save", async () => {
      const data = {
        payload: {
          sessionId: 123,
          email: TEST_EMAIL,
        },
      };

      await supertest(app)
        .post(SAVE_ENDPOINT)
        .send(data)
        .expect(200)
        .then((response) => {
          expect(response.body).toHaveProperty("expiryDate");
        });
    });

    it("throws an error for an invalid email address", async () => {
      const data = {
        payload: {
          sessionId: 123,
          email: "Not an email address",
        },
      };

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
          lowcal_sessions: [],
        },
      });

      queryMock.mockQuery({
        name: "SoftDeleteLowcalSession",
        data: {
          update_lowcal_sessions_by_pk: {
            id: 123,
          },
        },
        variables: {
          sessionId: 123,
        },
      });

      const data = {
        payload: {
          sessionId: 123,
          email: TEST_EMAIL,
        },
      };

      await supertest(app)
        .post(SAVE_ENDPOINT)
        .send(data)
        .expect(500)
        .then((response) => {
          expect(response.body).toHaveProperty("error");
        });
    });
  });

  describe("Invalid template", () => {
    it("throws an error if the template is missing", async () => {
      const data = {
        payload: {
          sessionId: 123,
          email: TEST_EMAIL,
        },
      };
      await supertest(app).post("/send-email").send(data).expect(404);
    });

    it("throws an error if a template is invalid", async () => {
      const data = {
        payload: {
          sessionId: 123,
          email: TEST_EMAIL,
        },
      };

      await supertest(app)
        .post("/send-email/not-a-template")
        .send(data)
        .expect(400)
        .then((response) => {
          expect(response.body).toHaveProperty("error", "Invalid template");
        });
    });
  });

  describe("Templates which require authorisation", () => {
    const templates = ["reminder", "expiry", "confirmation"];

    for (const template of templates) {
      describe(`${template} Template`, () => {
        it("returns 401 UNAUTHORIZED if no auth header is provided", async () => {
          const data = {
            payload: {
              sessionId: 123,
              email: TEST_EMAIL,
            },
          };
          await supertest(app)
            .post(`/send-email/${template}`)
            .send(data)
            .expect(401);
        });

        it("returns 401 UNAUTHORIZED if no incorrect auth header is provided", async () => {
          const data = {
            payload: {
              sessionId: 123,
              email: TEST_EMAIL,
            },
          };
          await supertest(app)
            .post(`/send-email/${template}`)
            .set("Authorization", "invalid-api-key")
            .send(data)
            .expect(401);
        });

        it("returns 200 OK if the correct headers are used", async () => {
          const data = {
            payload: {
              sessionId: 123,
              email: TEST_EMAIL,
            },
          };
          await supertest(app)
            .post(`/send-email/${template}`)
            .set("Authorization", "testtesttest")
            .send(data)
            .expect(200);
        });
      });
    }
  });

  describe("'Expiry' template", () => {
    it("soft deletes the session when an expiry email is sent", async () => {
      const data = {
        payload: {
          sessionId: 123,
          email: TEST_EMAIL,
        },
      };

      await supertest(app)
        .post(`/send-email/expiry`)
        .set("Authorization", "testtesttest")
        .send(data)
        .expect(200);

      const softDeleteSessionMock = queryMock
        .getCalls()
        .find((mock) => mock.id === "SoftDeleteLowcalSession");
      expect(
        softDeleteSessionMock?.response.data.update_lowcal_sessions_by_pk.id
      ).toEqual(123);
    });
  });
});

describe("Setting up send email events", () => {
  const callsToSetupEventsMutation = () =>
    queryMock.getCalls().filter((mock) => mock.id === "SetupEmailNotifications")
      .length;
  const data = {
    payload: {
      sessionId: 123,
      email: TEST_EMAIL,
    },
  };

  beforeEach(() => {
    queryMock.reset();
    queryMock.mockQuery(mockSoftDeleteLowcalSession);
    queryMock.mockQuery(mockSetupEmailNotifications);
  });

  test("Initial save sets ups email notifications", async () => {
    queryMock.mockQuery(mockValidateSingleSessionRequest);

    await supertest(app).post(SAVE_ENDPOINT).send(data).expect(200);
    expect(callsToSetupEventsMutation()).toBe(1);
  });

  test("Subsequent calls do not set up email notifications", async () => {
    queryMock.mockQuery({
      name: "ValidateSingleSessionRequest",
      data: {
        flows_by_pk: mockFlow,
        lowcal_sessions: [{ ...mockLowcalSession, has_user_saved: true }],
      },
      matchOnVariables: false,
    });

    await supertest(app).post(SAVE_ENDPOINT).send(data).expect(200);
    expect(callsToSetupEventsMutation()).toBe(0);
  });
});
