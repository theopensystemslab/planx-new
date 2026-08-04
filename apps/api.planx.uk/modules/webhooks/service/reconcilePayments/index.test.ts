import nock from "nock";
import supertest from "supertest";

import app from "../../../../server.js";
import { queryMock } from "../../../../tests/graphqlQueryMock.js";

const mockSend = vi.fn();
const mockSlackNotify = vi.fn().mockImplementation(() => ({ send: mockSend }));
vi.mock("slack-notify", () => ({
  default: (webhookURL: string) => mockSlackNotify(webhookURL),
}));

const { post } = supertest(app);

const ENDPOINT = "/webhooks/hasura/reconcile-payments";
const API_URL = "https://api.example.com";
const AUTH = { Authorization: process.env.HASURA_PLANX_API_KEY! };

const buildSession = ({
  sessionId,
  paymentId,
  status,
}: {
  sessionId: string;
  paymentId: string;
  status: string;
}) => ({
  sessionId,
  flowId: "7cd1c4b4-4229-424f-8d04-c9fdc958ef4e",
  flow: {
    name: "Apply for a lawful development certificate",
    team: { slug: "southwark", name: "Southwark" },
  },
  paymentStatus: [{ paymentId, status, amount: 25700 }],
});

const mockSessions = (sessions: ReturnType<typeof buildSession>[]) =>
  queryMock.mockQuery({
    name: "GetUnreconciledSessions",
    matchOnVariables: false,
    data: { sessions },
  });

describe("Payment reconciliation webhook", () => {
  beforeEach(() => {
    vi.stubEnv("APP_ENVIRONMENT", "production");
    mockSend.mockClear();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    nock.cleanAll();
  });

  it("returns a 401 without correct authentication", async () => {
    await post(ENDPOINT)
      .expect(401)
      .then((response) =>
        expect(response.body).toEqual({ error: "Unauthorised" }),
      );
  });

  it("flags a session which GOV.UK Pay reports as paid", async () => {
    mockSessions([
      buildSession({
        sessionId: "abc-123",
        paymentId: "pay_abc",
        status: "created",
      }),
    ]);

    const govPay = nock(API_URL)
      .get("/pay/southwark/pay_abc")
      .query(true)
      .reply(200, { state: { status: "success" } });

    await post(ENDPOINT)
      .set(AUTH)
      .expect(200)
      .then((response) => {
        expect(response.body).toMatchObject({
          checked: 1,
          unsubmitted: 1,
          errors: [],
        });
      });

    expect(govPay.isDone()).toBe(true);
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        channel: "#planx-notifications-internal",
        text: expect.stringMatching(/abc-123.*£257\.00.*Southwark/),
      }),
    );
  });

  it("ignores a session which GOV.UK Pay reports as unpaid", async () => {
    mockSessions([
      buildSession({
        sessionId: "abc-123",
        paymentId: "pay_abc",
        status: "started",
      }),
    ]);

    nock(API_URL)
      .get("/pay/southwark/pay_abc")
      .query(true)
      .reply(200, { state: { status: "failed" } });

    await post(ENDPOINT)
      .set(AUTH)
      .expect(200)
      .then((response) =>
        expect(response.body).toMatchObject({ checked: 1, unsubmitted: 0 }),
      );

    expect(mockSend).not.toHaveBeenCalled();
  });

  it("flags a session already recorded as paid without re-querying GOV.UK Pay", async () => {
    mockSessions([
      buildSession({
        sessionId: "abc-123",
        paymentId: "pay_abc",
        status: "success",
      }),
    ]);

    await post(ENDPOINT)
      .set(AUTH)
      .expect(200)
      .then((response) =>
        // `checked` is 0 - we already knew this was paid, so no GOV.UK Pay call was made
        expect(response.body).toMatchObject({ checked: 0, unsubmitted: 1 }),
      );

    expect(mockSend).toHaveBeenCalled();
    expect(nock.pendingMocks()).toEqual([]);
  });

  it("skips sessions where no money was taken", async () => {
    mockSessions([
      buildSession({
        sessionId: "abc-123",
        paymentId: "pay_abc",
        status: "cancelled",
      }),
    ]);

    await post(ENDPOINT)
      .set(AUTH)
      .expect(200)
      .then((response) =>
        expect(response.body).toMatchObject({ checked: 0, unsubmitted: 0 }),
      );

    expect(mockSend).not.toHaveBeenCalled();
  });

  it("continues reconciling after a failed lookup", async () => {
    mockSessions([
      buildSession({
        sessionId: "broken-session",
        paymentId: "pay_broken",
        status: "created",
      }),
      buildSession({
        sessionId: "paid-session",
        paymentId: "pay_ok",
        status: "created",
      }),
    ]);

    nock(API_URL).get("/pay/southwark/pay_broken").query(true).reply(500);
    nock(API_URL)
      .get("/pay/southwark/pay_ok")
      .query(true)
      .reply(200, { state: { status: "success" } });

    await post(ENDPOINT)
      .set(AUTH)
      .expect(200)
      .then((response) => {
        expect(response.body).toMatchObject({ checked: 2, unsubmitted: 1 });
        expect(response.body.errors).toHaveLength(1);
        expect(response.body.errors[0]).toMatch(/broken-session/);
      });

    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        text: expect.stringContaining("paid-session"),
      }),
    );
  });

  it("does not notify Slack outside of production", async () => {
    vi.stubEnv("APP_ENVIRONMENT", "staging");

    mockSessions([
      buildSession({
        sessionId: "abc-123",
        paymentId: "pay_abc",
        status: "success",
      }),
    ]);

    await post(ENDPOINT)
      .set(AUTH)
      .expect(200)
      .then((response) =>
        expect(response.body).toMatchObject({ unsubmitted: 1 }),
      );

    expect(mockSend).not.toHaveBeenCalled();
  });

  it("returns a 500 if the session query fails", async () => {
    queryMock.mockQuery({
      name: "GetUnreconciledSessions",
      matchOnVariables: false,
      data: {},
      graphqlErrors: [{ message: "Something went wrong" }],
    });

    await post(ENDPOINT)
      .set(AUTH)
      .expect(500)
      .then((response) =>
        expect(response.body.error).toMatch(/Failed to reconcile payments/),
      );
  });
});
