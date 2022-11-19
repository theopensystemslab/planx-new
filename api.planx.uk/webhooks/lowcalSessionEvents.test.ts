import supertest from "supertest";
import app from "../server";
import { createScheduledEvent } from "../hasura/metadata";

const { post } = supertest(app);

jest.mock("../hasura/metadata")
const mockedCreateScheduledEvent = createScheduledEvent as jest.MockedFunction<typeof createScheduledEvent>;

describe("Create reminder event webhook", () => {
  const ENDPOINT = "/webhooks/hasura/create-reminder-event"

  afterEach(() => jest.resetAllMocks());

  it("fails without correct authentication", () => {
    post(ENDPOINT)
      .expect(401)
      .then((response) => {
        expect(response.body).toEqual({
          error: "Unauthorised",
        });
      });
  });

  it("returns a 400 if a required value is missing", async () => {
    const missingCreatedAt = { createdAt: null, payload: {} } 
    const missingPayload = { createdAt: new Date(), payload: null } 

    for (const body of [ missingCreatedAt, missingPayload ]) {
      await post(ENDPOINT)
        .set({ Authorization: process.env.HASURA_PLANX_API_KEY })
        .send(body)
        .expect(400)
        .then((response) => expect(response.body.error).toEqual("Required value missing"));
    }
  });

  it("returns a 200 on successful event setup", async () => {
    const body = { createdAt: new Date(), payload: { sessionId: "123" } };
    mockedCreateScheduledEvent.mockResolvedValue("test");
  
    await post(ENDPOINT)
      .set({ Authorization: process.env.HASURA_PLANX_API_KEY })
      .send(body)
      .expect(200)
      .then((response) => {
        expect(response.body).toBe("test")
      });
  });

  it("passes the correct arguments along to createScheduledEvent", async () => {
    const body = { createdAt: new Date(), payload: { sessionId: "123" } };
    mockedCreateScheduledEvent.mockResolvedValue("test");
  
    await post(ENDPOINT)
      .set({ Authorization: process.env.HASURA_PLANX_API_KEY })
      .send(body)
      .expect(200)
      .then((response) => {
        expect(response.body).toBe("test")
      });
    const mockArgs = mockedCreateScheduledEvent.mock.calls[0][0];
    expect(mockArgs.webhook).toBe("{{HASURA_PLANX_API_URL}}/send-email/reminder");
    expect(mockArgs.payload).toMatchObject(body.payload);
    expect(mockArgs.comment).toBe(`reminder_${body.payload.sessionId}`);
  })

  it("returns a 500 on event setup failure", async () => {
    const body = { createdAt: new Date(), payload: { sessionId: "123" } };
    mockedCreateScheduledEvent.mockRejectedValue(new Error("Failed!"));
  
    await post(ENDPOINT)
      .set({ Authorization: process.env.HASURA_PLANX_API_KEY })
      .send(body)
      .expect(500)
      .then((response) => {
        expect(response.body.error).toMatch(/Failed to create reminder event/)
      });
  });
});

describe("Create expiry event webhook", () => {
  const ENDPOINT = "/webhooks/hasura/create-expiry-event"

  afterEach(() => jest.resetAllMocks());

  it("fails without correct authentication", () => {
    post(ENDPOINT)
      .expect(401)
      .then((response) => {
        expect(response.body).toEqual({
          error: "Unauthorised",
        });
      });
  });

  it("returns a 400 if a required value is missing", async () => {
    const missingCreatedAt = { createdAt: null, payload: {} } 
    const missingPayload = { createdAt: new Date(), payload: null } 

    for (const body of [ missingCreatedAt, missingPayload ]) {
      await post(ENDPOINT)
        .set({ Authorization: process.env.HASURA_PLANX_API_KEY })
        .send(body)
        .expect(400)
        .then((response) => expect(response.body.error).toEqual("Required value missing"));
    }
  });

  it("returns a 200 on successful event setup", async () => {
    const body = { createdAt: new Date(), payload: { sessionId: "123" } };
    mockedCreateScheduledEvent.mockResolvedValue("test");
  
    await post(ENDPOINT)
      .set({ Authorization: process.env.HASURA_PLANX_API_KEY })
      .send(body)
      .expect(200)
      .then((response) => {
        expect(response.body).toBe("test")
      });
  });

  it("passes the correct arguments along to createScheduledEvent", async () => {
    const body = { createdAt: new Date(), payload: { sessionId: "123" } };
    mockedCreateScheduledEvent.mockResolvedValue("test");
  
    await post(ENDPOINT)
      .set({ Authorization: process.env.HASURA_PLANX_API_KEY })
      .send(body)
      .expect(200)
      .then((response) => {
        expect(response.body).toBe("test")
      });
    const mockArgs = mockedCreateScheduledEvent.mock.calls[0][0];
    expect(mockArgs.webhook).toBe("{{HASURA_PLANX_API_URL}}/send-email/expiry");
    expect(mockArgs.payload).toMatchObject(body.payload);
    expect(mockArgs.comment).toBe(`expiry_${body.payload.sessionId}`);
  })

  it("returns a 500 on event setup failure", async () => {
    const body = { createdAt: new Date(), payload: { sessionId: "123" } };
    mockedCreateScheduledEvent.mockRejectedValue(new Error("Failed!"));
  
    await post(ENDPOINT)
      .set({ Authorization: process.env.HASURA_PLANX_API_KEY })
      .send(body)
      .expect(500)
      .then((response) => {
        expect(response.body.error).toMatch(/Failed to create expiry event/)
      });
  });
});