import supertest from "supertest";
import app from "../../../../server";
import { createScheduledEvent } from "../../../../hasura/metadata";
import { CreatePaymentEvent } from "./schema";

const { post } = supertest(app);

jest.mock("../../../../hasura/metadata");
const mockedCreateScheduledEvent = createScheduledEvent as jest.MockedFunction<
  typeof createScheduledEvent
>;

const mockScheduledEventResponse = {
  message: "success",
  event_id: "abc123",
} as const;

describe("Create payment invitation events webhook", () => {
  const ENDPOINT = "/webhooks/hasura/create-payment-invitation-events";

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
    const body: CreatePaymentEvent = {
      createdAt: new Date(),
      payload: { paymentRequestId: "123" },
    };
    mockedCreateScheduledEvent.mockResolvedValue(mockScheduledEventResponse);

    await post(ENDPOINT)
      .set({ Authorization: process.env.HASURA_PLANX_API_KEY })
      .send(body)
      .expect(200)
      .then((response) => {
        // it's queued up x2 invitations: one for the payee and one for the agent
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
      payload: { paymentRequestId: "123" },
    };
    mockedCreateScheduledEvent.mockResolvedValue(mockScheduledEventResponse);

    await post(ENDPOINT)
      .set({ Authorization: process.env.HASURA_PLANX_API_KEY })
      .send(body)
      .expect(200)
      .then((response) => {
        expect(response.body).toHaveLength(2);
        expect(response.body).toStrictEqual([
          mockScheduledEventResponse,
          mockScheduledEventResponse,
        ]);
      });

    const mockArgs = mockedCreateScheduledEvent.mock.calls[0][0];
    expect(mockArgs.webhook).toBe(
      "{{HASURA_PLANX_API_URL}}/send-email/invite-to-pay",
    );
    expect(mockArgs.payload).toMatchObject(body.payload);
    expect(mockArgs.comment).toBe(
      `payment_invitation_${body.payload.paymentRequestId}`,
    );

    const mockArgsSecondEvent = mockedCreateScheduledEvent.mock.calls[1][0];
    expect(mockArgsSecondEvent.webhook).toBe(
      "{{HASURA_PLANX_API_URL}}/send-email/invite-to-pay-agent",
    );
    expect(mockArgsSecondEvent.payload).toMatchObject(body.payload);
    expect(mockArgsSecondEvent.comment).toBe(
      `payment_invitation_agent_${body.payload.paymentRequestId}`,
    );
  });

  it("returns a 500 on event setup failure", async () => {
    const body = {
      createdAt: new Date(),
      payload: { paymentRequestId: "123" },
    };
    mockedCreateScheduledEvent.mockRejectedValue(new Error("Failed!"));

    await post(ENDPOINT)
      .set({ Authorization: process.env.HASURA_PLANX_API_KEY })
      .send(body)
      .expect(500)
      .then((response) => {
        expect(response.body.error).toMatch(
          /Failed to create payment invitation events/,
        );
      });
  });
});

describe("Create payment reminder events webhook", () => {
  const ENDPOINT = "/webhooks/hasura/create-payment-reminder-events";

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
      payload: { paymentRequestId: "123" },
    };
    mockedCreateScheduledEvent.mockResolvedValue(mockScheduledEventResponse);

    await post(ENDPOINT)
      .set({ Authorization: process.env.HASURA_PLANX_API_KEY })
      .send(body)
      .expect(200)
      .then((response) => {
        // it's queued up x4 reminders: 2 for the payee and 2 for the agent at 7 days and 1 day from expiry
        expect(response.body).toHaveLength(4);
        expect(response.body).toStrictEqual([
          mockScheduledEventResponse,
          mockScheduledEventResponse,
          mockScheduledEventResponse,
          mockScheduledEventResponse,
        ]);
      });
  });

  it("passes the correct arguments along to createScheduledEvent", async () => {
    const body = {
      createdAt: new Date(),
      payload: { paymentRequestId: "123" },
    };
    mockedCreateScheduledEvent.mockResolvedValue(mockScheduledEventResponse);

    await post(ENDPOINT)
      .set({ Authorization: process.env.HASURA_PLANX_API_KEY })
      .send(body)
      .expect(200)
      .then((response) => {
        expect(response.body).toHaveLength(4);
        expect(response.body).toStrictEqual([
          mockScheduledEventResponse,
          mockScheduledEventResponse,
          mockScheduledEventResponse,
          mockScheduledEventResponse,
        ]);
      });

    const mockArgs = mockedCreateScheduledEvent.mock.calls[0][0];
    expect(mockArgs.webhook).toBe(
      "{{HASURA_PLANX_API_URL}}/send-email/payment-reminder",
    );
    expect(mockArgs.payload).toMatchObject(body.payload);
    expect(mockArgs.comment).toBe(
      `payment_reminder_${body.payload.paymentRequestId}_7day`,
    );

    const mockArgsSecondEvent = mockedCreateScheduledEvent.mock.calls[1][0];
    expect(mockArgsSecondEvent.webhook).toBe(
      "{{HASURA_PLANX_API_URL}}/send-email/payment-reminder",
    );
    expect(mockArgsSecondEvent.payload).toMatchObject(body.payload);
    expect(mockArgsSecondEvent.comment).toBe(
      `payment_reminder_${body.payload.paymentRequestId}_1day`,
    );

    const mockArgsThirdEvent = mockedCreateScheduledEvent.mock.calls[2][0];
    expect(mockArgsThirdEvent.webhook).toBe(
      "{{HASURA_PLANX_API_URL}}/send-email/payment-reminder-agent",
    );
    expect(mockArgsThirdEvent.payload).toMatchObject(body.payload);
    expect(mockArgsThirdEvent.comment).toBe(
      `payment_reminder_agent_${body.payload.paymentRequestId}_7day`,
    );

    const mockArgsFourthEvent = mockedCreateScheduledEvent.mock.calls[3][0];
    expect(mockArgsFourthEvent.webhook).toBe(
      "{{HASURA_PLANX_API_URL}}/send-email/payment-reminder-agent",
    );
    expect(mockArgsFourthEvent.payload).toMatchObject(body.payload);
    expect(mockArgsFourthEvent.comment).toBe(
      `payment_reminder_agent_${body.payload.paymentRequestId}_1day`,
    );
  });

  it("returns a 500 on event setup failure", async () => {
    const body = {
      createdAt: new Date(),
      payload: { paymentRequestId: "123" },
    };
    mockedCreateScheduledEvent.mockRejectedValue(new Error("Failed!"));

    await post(ENDPOINT)
      .set({ Authorization: process.env.HASURA_PLANX_API_KEY })
      .send(body)
      .expect(500)
      .then((response) => {
        expect(response.body.error).toMatch(
          /Failed to create payment reminder events/,
        );
      });
  });
});

describe("Create payment expiry events webhook", () => {
  const ENDPOINT = "/webhooks/hasura/create-payment-expiry-events";

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
      payload: { paymentRequestId: "123" },
    };
    mockedCreateScheduledEvent.mockResolvedValue(mockScheduledEventResponse);

    await post(ENDPOINT)
      .set({ Authorization: process.env.HASURA_PLANX_API_KEY })
      .send(body)
      .expect(200)
      .then((response) => {
        // it's queued up x2 expiries: one for the payee and one for the agent
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
      payload: { paymentRequestId: "123" },
    };
    mockedCreateScheduledEvent.mockResolvedValue(mockScheduledEventResponse);

    await post(ENDPOINT)
      .set({ Authorization: process.env.HASURA_PLANX_API_KEY })
      .send(body)
      .expect(200)
      .then((response) => {
        expect(response.body).toHaveLength(2);
        expect(response.body).toStrictEqual([
          mockScheduledEventResponse,
          mockScheduledEventResponse,
        ]);
      });

    const mockArgs = mockedCreateScheduledEvent.mock.calls[0][0];
    expect(mockArgs.webhook).toBe(
      "{{HASURA_PLANX_API_URL}}/send-email/payment-expiry",
    );
    expect(mockArgs.payload).toMatchObject(body.payload);
    expect(mockArgs.comment).toBe(
      `payment_expiry_${body.payload.paymentRequestId}`,
    );

    const mockArgsSecondEvent = mockedCreateScheduledEvent.mock.calls[1][0];
    expect(mockArgsSecondEvent.webhook).toBe(
      "{{HASURA_PLANX_API_URL}}/send-email/payment-expiry-agent",
    );
    expect(mockArgsSecondEvent.payload).toMatchObject(body.payload);
    expect(mockArgsSecondEvent.comment).toBe(
      `payment_expiry_agent_${body.payload.paymentRequestId}`,
    );
  });

  it("returns a 500 on event setup failure", async () => {
    const body = {
      createdAt: new Date(),
      payload: { paymentRequestId: "123" },
    };
    mockedCreateScheduledEvent.mockRejectedValue(new Error("Failed!"));

    await post(ENDPOINT)
      .set({ Authorization: process.env.HASURA_PLANX_API_KEY })
      .send(body)
      .expect(500)
      .then((response) => {
        expect(response.body.error).toMatch(
          /Failed to create payment expiry events/,
        );
      });
  });
});
