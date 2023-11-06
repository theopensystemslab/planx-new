import supertest from "supertest";
import app from "../../../../server";
import { createScheduledEvent } from "../../../../lib/hasura/metadata";

const { post } = supertest(app);

jest.mock("../../../../lib/hasura/metadata");
const mockedCreateScheduledEvent = createScheduledEvent as jest.MockedFunction<
  typeof createScheduledEvent
>;

const mockScheduledEventResponse = {
  message: "success",
  event_id: "abc123",
} as const;

describe("Create reminder event webhook", () => {
  const ENDPOINT = "/webhooks/hasura/create-reminder-event";

  afterEach(() => jest.resetAllMocks());

  it("fails without correct authentication", async () => {
    await post(ENDPOINT)
      .expect(401)
      .then((response) => {
        expect(response.body).toEqual({
          error: "Unauthorised",
        });
      });
  });

  it("returns a 400 if a required value is missing", async () => {
    const missingCreatedAt = { createdAt: null, payload: {} };
    const missingPayload = { createdAt: new Date(), payload: null };
    const missingEmail = {
      createdAt: new Date(),
      payload: { sessionId: "abc123" },
    };
    const missingSessionId = {
      createdAt: new Date(),
      payload: { email: "test@example.com" },
    };

    const invalidRequestBodies = [
      missingCreatedAt,
      missingPayload,
      missingEmail,
      missingSessionId,
    ];

    for (const body of invalidRequestBodies) {
      await post(ENDPOINT)
        .set({ Authorization: process.env.HASURA_PLANX_API_KEY })
        .send(body)
        .expect(400)
        .then((response) => {
          expect(response.body).toHaveProperty("issues");
          expect(response.body).toHaveProperty("name", "ZodError");
        });
    }
  });

  it("returns a 200 on successful event setup", async () => {
    const body = {
      createdAt: new Date(),
      payload: { sessionId: "123", email: "test@example.com" },
    };
    mockedCreateScheduledEvent.mockResolvedValue(mockScheduledEventResponse);

    await post(ENDPOINT)
      .set({ Authorization: process.env.HASURA_PLANX_API_KEY })
      .send(body)
      .expect(200)
      .then((response) => {
        // it's queued up x2 reminders for 7 days and 1 day from expiry
        expect(response.body).toHaveLength(2);
        expect(response.body).toStrictEqual([
          mockScheduledEventResponse,
          mockScheduledEventResponse,
        ]);
      });
  });

  it("passes the correct arguments along to createScheduledEvent", async () => {
    const body = {
      createdAt: new Date(),
      payload: { sessionId: "123", email: "test@example.com" },
    };
    mockedCreateScheduledEvent.mockResolvedValue(mockScheduledEventResponse);

    await post(ENDPOINT)
      .set({ Authorization: process.env.HASURA_PLANX_API_KEY })
      .send(body)
      .expect(200)
      .then((response) => {
        expect(response.body).toStrictEqual([
          mockScheduledEventResponse,
          mockScheduledEventResponse,
        ]);
      });

    const mockArgs = mockedCreateScheduledEvent.mock.calls[0][0];
    expect(mockArgs.webhook).toBe(
      "{{HASURA_PLANX_API_URL}}/send-email/reminder",
    );
    expect(mockArgs.payload).toMatchObject(body.payload);
    expect(mockArgs.comment).toBe(`reminder_${body.payload.sessionId}_7day`);

    const mockArgsSecondEvent = mockedCreateScheduledEvent.mock.calls[1][0];
    expect(mockArgsSecondEvent.webhook).toBe(
      "{{HASURA_PLANX_API_URL}}/send-email/reminder",
    );
    expect(mockArgsSecondEvent.payload).toMatchObject(body.payload);
    expect(mockArgsSecondEvent.comment).toBe(
      `reminder_${body.payload.sessionId}_1day`,
    );
  });

  it("returns a 500 on event setup failure", async () => {
    const body = {
      createdAt: new Date(),
      payload: { sessionId: "123", email: "test@example.com" },
    };
    mockedCreateScheduledEvent.mockRejectedValue(new Error("Failed!"));

    await post(ENDPOINT)
      .set({ Authorization: process.env.HASURA_PLANX_API_KEY })
      .send(body)
      .expect(500)
      .then((response) => {
        expect(response.body.error).toMatch(
          /Failed to create session reminder event/,
        );
      });
  });
});

describe("Create expiry event webhook", () => {
  const ENDPOINT = "/webhooks/hasura/create-expiry-event";

  afterEach(() => jest.resetAllMocks());

  it("fails without correct authentication", async () => {
    await post(ENDPOINT)
      .expect(401)
      .then((response) => {
        expect(response.body).toEqual({
          error: "Unauthorised",
        });
      });
  });

  it("returns a 400 if a required value is missing", async () => {
    const missingCreatedAt = { createdAt: null, payload: {} };
    const missingPayload = { createdAt: new Date(), payload: null };

    for (const body of [missingCreatedAt, missingPayload]) {
      await post(ENDPOINT)
        .set({ Authorization: process.env.HASURA_PLANX_API_KEY })
        .send(body)
        .expect(400)
        .then((response) => {
          expect(response.body).toHaveProperty("issues");
          expect(response.body).toHaveProperty("name", "ZodError");
        });
    }
  });

  it("returns a 200 on successful event setup", async () => {
    const body = {
      createdAt: new Date(),
      payload: { sessionId: "123", email: "test@example.com" },
    };
    mockedCreateScheduledEvent.mockResolvedValue(mockScheduledEventResponse);

    await post(ENDPOINT)
      .set({ Authorization: process.env.HASURA_PLANX_API_KEY })
      .send(body)
      .expect(200)
      .then((response) => {
        // expect(mockedCreateScheduledEvent).toHaveBeenCalledWith(body.p)
        expect(response.body).toStrictEqual([mockScheduledEventResponse]);
      });
  });

  it("passes the correct arguments along to createScheduledEvent", async () => {
    const body = {
      createdAt: new Date(),
      payload: { sessionId: "123", email: "test@example.com" },
    };
    mockedCreateScheduledEvent.mockResolvedValue(mockScheduledEventResponse);

    await post(ENDPOINT)
      .set({ Authorization: process.env.HASURA_PLANX_API_KEY })
      .send(body)
      .expect(200)
      .then((response) => {
        expect(response.body).toStrictEqual([mockScheduledEventResponse]);
      });
    const mockArgs = mockedCreateScheduledEvent.mock.calls[0][0];
    expect(mockArgs.webhook).toBe("{{HASURA_PLANX_API_URL}}/send-email/expiry");
    expect(mockArgs.payload).toMatchObject(body.payload);
    expect(mockArgs.comment).toBe(`expiry_${body.payload.sessionId}`);
  });

  it("returns a 500 on event setup failure", async () => {
    const body = {
      createdAt: new Date(),
      payload: { sessionId: "123", email: "test@example.com" },
    };
    mockedCreateScheduledEvent.mockRejectedValue(new Error("Failed!"));

    await post(ENDPOINT)
      .set({ Authorization: process.env.HASURA_PLANX_API_KEY })
      .send(body)
      .expect(500)
      .then((response) => {
        expect(response.body.error).toMatch(
          /Failed to create session expiry event/,
        );
      });
  });
});
