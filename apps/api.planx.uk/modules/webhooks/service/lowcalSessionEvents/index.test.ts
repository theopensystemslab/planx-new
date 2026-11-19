import { addDays, subDays } from "date-fns";
import supertest from "supertest";
import type { MockedFunction } from "vitest";

import {
  createScheduledEvent,
  deleteScheduledEvent,
  getScheduledEvents,
} from "../../../../lib/hasura/metadata/index.js";
import type {
  DeleteScheduledEventArgs,
  GetScheduledEventsArgs,
  RequiredCreateScheduledEventArgs,
} from "../../../../lib/hasura/metadata/types.js";
import app from "../../../../server.js";
import { MOCK_UUID } from "../../../../tests/mocks/lowcalSessionMocks.js";
import { DAYS_UNTIL_EXPIRY } from "../../../saveAndReturn/service/utils.js";
import {
  DELETE_EVENT_COMMENT_TEMPLATE,
  rescheduleSessionEmailEvents,
} from "./index.js";

const { post } = supertest(app);

const CREATED_AT_TIME = new Date();
const SCHEDULED_AT_TIME = addDays(CREATED_AT_TIME, DAYS_UNTIL_EXPIRY);

vi.mock("../../../../lib/hasura/metadata");
const mockedCreateScheduledEvent = createScheduledEvent as MockedFunction<
  typeof createScheduledEvent
>;
const mockCreateScheduledEventResponse = {
  message: "success",
  event_id: "abc123",
} as const;

const mockedGetScheduledEvents = getScheduledEvents as MockedFunction<
  typeof getScheduledEvents
>;
const mockGetScheduledEventsResponse = {
  count: 1,
  events: [
    {
      comment: DELETE_EVENT_COMMENT_TEMPLATE(MOCK_UUID),
      id: "abc123",
      payload: {
        sessionId: MOCK_UUID,
      },
      created_at: CREATED_AT_TIME.toISOString(),
      scheduled_time: SCHEDULED_AT_TIME.toISOString(),
      status: "scheduled",
    },
  ],
} as const;

const mockedDeleteScheduledEvent = deleteScheduledEvent as MockedFunction<
  typeof deleteScheduledEvent
>;
const mockDeleteScheduledEventResponse = {
  message: "success",
} as const;

describe("Create reminder event webhook", () => {
  const ENDPOINT = "/webhooks/hasura/create-reminder-event";

  afterEach(() => {
    vi.resetAllMocks();
  });

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
    const missingPayload = { createdAt: CREATED_AT_TIME, payload: null };
    const missingEmail = {
      createdAt: CREATED_AT_TIME,
      payload: { sessionId: MOCK_UUID },
    };
    const missingSessionId = {
      createdAt: CREATED_AT_TIME,
      payload: { email: "test@example.com" },
    };

    const cases = [
      {
        body: missingCreatedAt,
        path: ["body", "createdAt"],
        code: "invalid_type",
      },
      { body: missingPayload, path: ["body", "payload"], code: "invalid_type" },
      {
        body: missingEmail,
        path: ["body", "payload", "email"],
        code: "invalid_type",
      },
      {
        body: missingSessionId,
        path: ["body", "payload", "sessionId"],
        code: "invalid_type",
      },
    ];

    for (const { body, path, code } of cases) {
      await post(ENDPOINT)
        .set({ Authorization: process.env.HASURA_PLANX_API_KEY! })
        .send(body)
        .expect(400)
        .then((response) => {
          expect(response.body.issues).toContainEqual(
            expect.objectContaining({ path, code }),
          );
        });
    }
  });

  it("returns a 200 on successful event setup", async () => {
    const body = {
      createdAt: CREATED_AT_TIME,
      payload: { sessionId: MOCK_UUID, email: "test@example.com" },
    };
    mockedCreateScheduledEvent.mockResolvedValue(
      mockCreateScheduledEventResponse,
    );

    await post(ENDPOINT)
      .set({ Authorization: process.env.HASURA_PLANX_API_KEY! })
      .send(body)
      .expect(200)
      .then((response) => {
        // it's queued up x2 reminders for 7 days and 1 day from expiry
        expect(response.body).toHaveLength(2);
        expect(response.body).toStrictEqual([
          mockCreateScheduledEventResponse,
          mockCreateScheduledEventResponse,
        ]);
      });
  });

  it("passes the correct arguments along to createScheduledEvent", async () => {
    const body = {
      createdAt: CREATED_AT_TIME,
      payload: { sessionId: MOCK_UUID, email: "test@example.com" },
    };
    mockedCreateScheduledEvent.mockResolvedValue(
      mockCreateScheduledEventResponse,
    );

    await post(ENDPOINT)
      .set({ Authorization: process.env.HASURA_PLANX_API_KEY! })
      .send(body)
      .expect(200)
      .then((response) => {
        expect(response.body).toStrictEqual([
          mockCreateScheduledEventResponse,
          mockCreateScheduledEventResponse,
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
      createdAt: CREATED_AT_TIME,
      payload: { sessionId: MOCK_UUID, email: "test@example.com" },
    };
    mockedCreateScheduledEvent.mockRejectedValue(new Error("Failed!"));

    await post(ENDPOINT)
      .set({ Authorization: process.env.HASURA_PLANX_API_KEY! })
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

  afterEach(() => {
    vi.resetAllMocks();
  });

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
    const missingPayload = { createdAt: CREATED_AT_TIME, payload: null };

    const cases = [
      {
        body: missingCreatedAt,
        path: ["body", "createdAt"],
        code: "invalid_type",
      },
      { body: missingPayload, path: ["body", "payload"], code: "invalid_type" },
    ];

    for (const { body, path, code } of cases) {
      await post(ENDPOINT)
        .set({ Authorization: process.env.HASURA_PLANX_API_KEY! })
        .send(body)
        .expect(400)
        .then((response) => {
          expect(response.body.issues).toContainEqual(
            expect.objectContaining({ path, code }),
          );
        });
    }
  });

  it("returns a 200 on successful event setup", async () => {
    const body = {
      createdAt: CREATED_AT_TIME,
      payload: { sessionId: MOCK_UUID, email: "test@example.com" },
    };
    mockedCreateScheduledEvent.mockResolvedValue(
      mockCreateScheduledEventResponse,
    );

    await post(ENDPOINT)
      .set({ Authorization: process.env.HASURA_PLANX_API_KEY! })
      .send(body)
      .expect(200)
      .then((response) => {
        // expect(mockedCreateScheduledEvent).toHaveBeenCalledWith(body.p)
        expect(response.body).toStrictEqual([mockCreateScheduledEventResponse]);
      });
  });

  it("passes the correct arguments along to createScheduledEvent", async () => {
    const body = {
      createdAt: CREATED_AT_TIME,
      payload: { sessionId: MOCK_UUID, email: "test@example.com" },
    };
    mockedCreateScheduledEvent.mockResolvedValue(
      mockCreateScheduledEventResponse,
    );

    await post(ENDPOINT)
      .set({ Authorization: process.env.HASURA_PLANX_API_KEY! })
      .send(body)
      .expect(200)
      .then((response) => {
        expect(response.body).toStrictEqual([mockCreateScheduledEventResponse]);
      });
    const mockArgs = mockedCreateScheduledEvent.mock.calls[0][0];
    expect(mockArgs.webhook).toBe("{{HASURA_PLANX_API_URL}}/send-email/expiry");
    expect(mockArgs.payload).toMatchObject(body.payload);
    expect(mockArgs.comment).toBe(`expiry_${body.payload.sessionId}`);
  });

  it("returns a 500 on event setup failure", async () => {
    const body = {
      createdAt: CREATED_AT_TIME,
      payload: { sessionId: MOCK_UUID, email: "test@example.com" },
    };
    mockedCreateScheduledEvent.mockRejectedValue(new Error("Failed!"));

    await post(ENDPOINT)
      .set({ Authorization: process.env.HASURA_PLANX_API_KEY! })
      .send(body)
      .expect(500)
      .then((response) => {
        expect(response.body.error).toMatch(
          /Failed to create session expiry event/,
        );
      });
  });
});

describe("Create delete event webhook", () => {
  const ENDPOINT = "/webhooks/hasura/create-delete-event";

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("fails without correct authentication", async () => {
    await post(ENDPOINT)
      .expect(401)
      .then((response) => {
        expect(response.body).toEqual({
          error: "Unauthorised",
        });
      });
  });

  it("returns a 400 if a required value is missing or invalid", async () => {
    const missingCreatedAt = {
      createdAt: null,
      payload: { sessionId: MOCK_UUID },
    };
    const missingPayload = { createdAt: CREATED_AT_TIME, payload: null };
    const invalidOperation = {
      lockedAt: CREATED_AT_TIME,
      operation: "DELETE",
      payload: { sessionId: MOCK_UUID },
    };

    const cases = [
      {
        body: missingCreatedAt,
        path: ["body", "createdAt"],
        code: "invalid_type",
      },
      { body: missingPayload, path: ["body", "payload"], code: "invalid_type" },
      {
        body: invalidOperation,
        path: ["body", "operation"],
        code: "invalid_value",
      },
    ];

    for (const { body, path, code } of cases) {
      await post(ENDPOINT)
        .set({ Authorization: process.env.HASURA_PLANX_API_KEY! })
        .send(body)
        .expect(400)
        .then((response) => {
          expect(response.body.issues).toContainEqual(
            expect.objectContaining({ path, code }),
          );
        });
    }
  });

  it("returns a 200 on successful event setup (on lowcal_sessions insert)", async () => {
    const body = {
      createdAt: CREATED_AT_TIME,
      operation: "INSERT",
      payload: { sessionId: MOCK_UUID },
    };
    const create_args: RequiredCreateScheduledEventArgs = {
      webhook: "{{HASURA_PLANX_API_URL}}/webhooks/hasura/delete-session",
      schedule_at: SCHEDULED_AT_TIME,
      payload: { sessionId: MOCK_UUID },
      comment: DELETE_EVENT_COMMENT_TEMPLATE(MOCK_UUID),
    };
    mockedCreateScheduledEvent.mockResolvedValue(
      mockCreateScheduledEventResponse,
    );

    await post(ENDPOINT)
      .set({ Authorization: process.env.HASURA_PLANX_API_KEY! })
      .send(body)
      .expect(200)
      .then((response) => {
        expect(mockedCreateScheduledEvent).toHaveBeenCalledWith(create_args);
        expect(response.body).toStrictEqual([mockCreateScheduledEventResponse]);
      });
  });

  it("returns a 200 on successful event setup (on lowcal_sessions update after ITP)", async () => {
    const body = {
      lockedAt: CREATED_AT_TIME,
      operation: "UPDATE",
      payload: { sessionId: MOCK_UUID },
    };
    const create_args: RequiredCreateScheduledEventArgs = {
      webhook: "{{HASURA_PLANX_API_URL}}/webhooks/hasura/delete-session",
      schedule_at: SCHEDULED_AT_TIME,
      payload: { sessionId: MOCK_UUID },
      comment: DELETE_EVENT_COMMENT_TEMPLATE(MOCK_UUID),
    };
    const get_args: GetScheduledEventsArgs = {
      type: "one_off",
      get_rows_count: true,
      status: ["scheduled"],
    };
    const delete_args: DeleteScheduledEventArgs = {
      type: "one_off",
      event_id: "abc123",
    };
    mockedCreateScheduledEvent.mockResolvedValue(
      mockCreateScheduledEventResponse,
    );
    mockedGetScheduledEvents.mockResolvedValue(mockGetScheduledEventsResponse);
    mockedDeleteScheduledEvent.mockResolvedValue(
      mockDeleteScheduledEventResponse,
    );

    await post(ENDPOINT)
      .set({ Authorization: process.env.HASURA_PLANX_API_KEY! })
      .send(body)
      .expect(200)
      .then((response) => {
        expect(mockedGetScheduledEvents).toHaveBeenCalledWith(get_args);
        expect(mockedDeleteScheduledEvent).toHaveBeenCalledWith(delete_args);
        expect(mockedCreateScheduledEvent).toHaveBeenCalledWith(create_args);
        expect(response.body).toStrictEqual([mockCreateScheduledEventResponse]);
      });
  });

  it("schedules the delete event from when the first delayed payment was started, so paying again can't extend the window", async () => {
    const delayedPaymentStartedAt = subDays(CREATED_AT_TIME, 10);
    const body = {
      lockedAt: CREATED_AT_TIME,
      delayedPaymentStartedAt,
      operation: "UPDATE",
      payload: { sessionId: MOCK_UUID },
    };
    mockedCreateScheduledEvent.mockResolvedValue(
      mockCreateScheduledEventResponse,
    );
    mockedGetScheduledEvents.mockResolvedValue(mockGetScheduledEventsResponse);
    mockedDeleteScheduledEvent.mockResolvedValue(
      mockDeleteScheduledEventResponse,
    );

    await post(ENDPOINT)
      .set({ Authorization: process.env.HASURA_PLANX_API_KEY! })
      .send(body)
      .expect(200);

    expect(mockedDeleteScheduledEvent).toHaveBeenCalled();
    expect(mockedCreateScheduledEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        schedule_at: addDays(delayedPaymentStartedAt, DAYS_UNTIL_EXPIRY),
      }),
    );
  });

  it("leaves the existing delete event in place when the session is unlocked", async () => {
    const body = {
      lockedAt: null,
      delayedPaymentStartedAt: CREATED_AT_TIME,
      operation: "UPDATE",
      payload: { sessionId: MOCK_UUID },
    };

    await post(ENDPOINT)
      .set({ Authorization: process.env.HASURA_PLANX_API_KEY! })
      .send(body)
      .expect(200)
      .then((response) => {
        expect(response.body).toStrictEqual([]);
      });

    expect(mockedDeleteScheduledEvent).not.toHaveBeenCalled();
    expect(mockedCreateScheduledEvent).not.toHaveBeenCalled();
  });

  it("returns a 500 on event setup failure", async () => {
    const body = {
      createdAt: CREATED_AT_TIME,
      operation: "INSERT",
      payload: { sessionId: MOCK_UUID },
    };
    mockedCreateScheduledEvent.mockRejectedValue(new Error("Failed!"));

    await post(ENDPOINT)
      .set({ Authorization: process.env.HASURA_PLANX_API_KEY! })
      .send(body)
      .expect(500)
      .then((response) => {
        expect(response.body.error).toMatch(
          /Failed to create session delete event/,
        );
      });
  });
});

describe("rescheduling a session's reminder and expiry emails", () => {
  const OTHER_SESSION_ID = "0d6b1a4e-58a6-4b3e-9f0a-3c2d1b0a9e8f";
  const scheduledEvent = (id: string, comment: string) => ({
    ...mockGetScheduledEventsResponse.events[0],
    id,
    comment,
  });

  beforeEach(() => {
    mockedGetScheduledEvents.mockResolvedValue({
      count: 5,
      events: [
        scheduledEvent("reminder-7", `reminder_${MOCK_UUID}_7day`),
        scheduledEvent("reminder-1", `reminder_${MOCK_UUID}_1day`),
        scheduledEvent("expiry", `expiry_${MOCK_UUID}`),
        scheduledEvent("delete", DELETE_EVENT_COMMENT_TEMPLATE(MOCK_UUID)),
        scheduledEvent("other", `expiry_${OTHER_SESSION_ID}`),
      ],
    });
    mockedDeleteScheduledEvent.mockResolvedValue(
      mockDeleteScheduledEventResponse,
    );
    mockedCreateScheduledEvent.mockResolvedValue(
      mockCreateScheduledEventResponse,
    );
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("replaces only this session's reminder and expiry events, leaving its delete event alone", async () => {
    await rescheduleSessionEmailEvents({
      from: CREATED_AT_TIME,
      payload: { sessionId: MOCK_UUID, email: "test@example.com" },
    });

    expect(
      mockedDeleteScheduledEvent.mock.calls.map(([args]) => args.event_id),
    ).toEqual(["reminder-7", "reminder-1", "expiry"]);
  });

  it("counts down to 28 days from the new date", async () => {
    const from = subDays(CREATED_AT_TIME, 10);
    const payload = { sessionId: MOCK_UUID, email: "test@example.com" };

    await rescheduleSessionEmailEvents({ from, payload });

    const scheduled = mockedCreateScheduledEvent.mock.calls.map(([args]) => ({
      comment: args.comment,
      scheduleAt: args.schedule_at,
      payload: args.payload,
    }));
    expect(scheduled).toEqual([
      {
        comment: `reminder_${MOCK_UUID}_7day`,
        scheduleAt: addDays(from, DAYS_UNTIL_EXPIRY - 7),
        payload,
      },
      {
        comment: `reminder_${MOCK_UUID}_1day`,
        scheduleAt: addDays(from, DAYS_UNTIL_EXPIRY - 1),
        payload,
      },
      {
        comment: `expiry_${MOCK_UUID}`,
        scheduleAt: addDays(from, DAYS_UNTIL_EXPIRY),
        payload,
      },
    ]);
  });
});
