import supertest from "supertest";

import app from "../../../../server.js";
import { queryMock } from "../../../../tests/graphqlQueryMock.js";
import {
  applicant,
  notFoundSession,
  payee,
  paymentRequestResponse,
  validSession,
} from "../../../../tests/mocks/inviteToPayData.js";
import {
  createPaymentRequestQueryMock,
  detailedValidSessionQueryMock,
  findSessionForInviteQueryMock,
  getPublishedFlowDataQueryMock,
  lockSessionQueryMock,
  unlockSessionQueryMock,
} from "../../../../tests/mocks/inviteToPayMocks.js";
import {
  mockExpire,
  mockInitiatedCheckoutSessions,
  mockRetrieve,
} from "../../../stripe/checkout/test/mocks.js";

vi.mock(
  "stripe",
  async () =>
    (await import("../../../stripe/checkout/test/mocks.js")).mockStripeModule,
);

describe("Invite to pay API route", () => {
  const inviteToPayBaseRoute = "/invite-to-pay";
  const validSessionURL = `${inviteToPayBaseRoute}/${validSession.id}`;
  const notFoundSessionURL = `${inviteToPayBaseRoute}/${notFoundSession.id}`;
  const validPostBody = {
    email: applicant.email,
    applicantName: applicant.name,
    payeeEmail: payee.email,
    payeeName: payee.name,
    sessionPreviewKeys: [["_address", "title"], ["proposal.projectType"]],
  };

  const callsTo = (name: string) =>
    queryMock.getCalls().filter((call) => call.id === name).length;

  const hasuraError = {
    graphqlErrors: [{ message: "Something went wrong with Hasura" }],
    data: {},
    matchOnVariables: false,
  };

  beforeEach(() => {
    mockRetrieve.mockReset();
    mockExpire.mockReset();
    mockInitiatedCheckoutSessions();
  });

  afterEach(() => {
    queryMock.reset();
  });

  const findSessionHeaders = () =>
    queryMock.getCalls().find((call) => call.id === "FindSessionForInvite")
      ?.headers;

  describe("valid request scenarios", () => {
    beforeEach(() => {
      queryMock.mockQuery(findSessionForInviteQueryMock);
      queryMock.mockQuery(lockSessionQueryMock);
      queryMock.mockQuery(detailedValidSessionQueryMock);
      queryMock.mockQuery(getPublishedFlowDataQueryMock);
      queryMock.mockQuery(createPaymentRequestQueryMock);
    });

    test("a valid sessionId and applicant email", async () => {
      await supertest(app)
        .post(validSessionURL)
        .send(validPostBody)
        .expect(200)
        .then((response) => {
          expect(response.body).toEqual(paymentRequestResponse);
        });

      // Session ownership is checked by the Public role, scoped by these headers
      expect(findSessionHeaders()).toMatchObject({
        "x-hasura-lowcal-session-id": [validSession.id],
        "x-hasura-lowcal-email": [applicant.email],
      });
      expect(callsTo("LockSession")).toBe(1);
      expect(callsTo("CreatePaymentRequest")).toBe(1);
    });

    test("an applicant email in a different case still matches", async () => {
      await supertest(app)
        .post(validSessionURL)
        .send({
          ...validPostBody,
          email: applicant.email.toUpperCase(),
        })
        .expect(200);

      expect(findSessionHeaders()).toMatchObject({
        "x-hasura-lowcal-email": [applicant.email],
      });
      expect(callsTo("LockSession")).toBe(1);
    });
  });

  describe("Stripe Checkout Sessions started by the applicant", () => {
    const mockCheckoutSessions = (
      sessions: { id: string; status: string }[],
    ) => {
      mockInitiatedCheckoutSessions(sessions.map(({ id }) => id));
      mockRetrieve.mockImplementation(async (id: string) =>
        sessions.find((session) => session.id === id),
      );
    };

    beforeEach(() => {
      queryMock.mockQuery(findSessionForInviteQueryMock);
      queryMock.mockQuery(lockSessionQueryMock);
      queryMock.mockQuery(detailedValidSessionQueryMock);
      queryMock.mockQuery(getPublishedFlowDataQueryMock);
      queryMock.mockQuery(createPaymentRequestQueryMock);
    });

    test("a session with no Stripe Checkout Sessions makes no calls to Stripe", async () => {
      await supertest(app)
        .post(validSessionURL)
        .send(validPostBody)
        .expect(200);

      const lookup = queryMock
        .getCalls()
        .find((call) => call.id === "GetInitiatedCheckoutSessions");
      expect(lookup?.variables).toEqual({ sessionId: validSession.id });
      expect(mockRetrieve).not.toHaveBeenCalled();
      expect(mockExpire).not.toHaveBeenCalled();
    });

    test("an open Checkout Session is expired before the session is locked", async () => {
      mockCheckoutSessions([{ id: "cs_test_open", status: "open" }]);

      let lockCallsBeforeExpiry: number | undefined;
      mockExpire.mockImplementation(async (id: string) => {
        lockCallsBeforeExpiry = callsTo("LockSession");
        return { id, status: "expired" };
      });

      await supertest(app)
        .post(validSessionURL)
        .send(validPostBody)
        .expect(200)
        .then((response) => {
          expect(response.body).toEqual(paymentRequestResponse);
        });

      expect(mockExpire).toHaveBeenCalledTimes(1);
      expect(mockExpire).toHaveBeenCalledWith("cs_test_open");
      expect(lockCallsBeforeExpiry).toBe(0);
      expect(callsTo("LockSession")).toBe(1);
      expect(callsTo("CreatePaymentRequest")).toBe(1);
    });

    test("a completed Checkout Session means the session cannot be locked", async () => {
      mockCheckoutSessions([{ id: "cs_test_paid", status: "complete" }]);

      await supertest(app)
        .post(validSessionURL)
        .send(validPostBody)
        .expect(422)
        .then((response) => {
          expect(response.body.error).toMatch(/has already been paid for/);
        });

      expect(callsTo("LockSession")).toBe(0);
      expect(callsTo("CreatePaymentRequest")).toBe(0);
    });

    test("a failure to reach Stripe means the session cannot be locked", async () => {
      mockInitiatedCheckoutSessions(["cs_test_open"]);
      mockRetrieve.mockRejectedValue(new Error("Stripe is down"));

      await supertest(app)
        .post(validSessionURL)
        .send(validPostBody)
        .expect(500)
        .then((response) => {
          expect(response.body.error).toMatch(
            /failed to expire open Stripe Checkout Sessions/,
          );
        });

      expect(callsTo("LockSession")).toBe(0);
      expect(callsTo("CreatePaymentRequest")).toBe(0);
    });
  });

  describe("invalid request scenarios", () => {
    test("route without a sessionId parameter", async () => {
      await supertest(app).post("/invite-to-pay").expect(404);
    });

    test("a missing payee name", async () => {
      const invalidPostBody = { ...validPostBody, payeeName: null };
      await supertest(app)
        .post(validSessionURL)
        .send(invalidPostBody)
        .expect(400)
        .then((response) => {
          expect(response.body).toHaveProperty("issues");
          expect(response.body).toHaveProperty("name", "ZodError");
        });
    });

    test("a missing payee email address", async () => {
      const invalidPostBody = { ...validPostBody, payeeEmail: null };
      await supertest(app)
        .post(validSessionURL)
        .send(invalidPostBody)
        .expect(400)
        .then((response) => {
          expect(response.body).toHaveProperty("issues");
          expect(response.body).toHaveProperty("name", "ZodError");
        });
    });

    test.each([
      ["missing", undefined],
      ["empty", ""],
      ["invalid", "not-an-email"],
    ])("a %s applicant email address leads to a failure", async (_, email) => {
      await supertest(app)
        .post(validSessionURL)
        .send({ ...validPostBody, email })
        .expect(400)
        .then((response) => {
          expect(response.body).toHaveProperty("name", "ZodError");
        });

      expect(callsTo("FindSessionForInvite")).toBe(0);
      expect(callsTo("LockSession")).toBe(0);
    });

    test("an applicant email which does not match the session", async () => {
      const wrongEmail = "someone-else@opensystemslab.io";

      queryMock.mockQuery({
        ...findSessionForInviteQueryMock,
        data: { sessions: [] },
      });

      await supertest(app)
        .post(validSessionURL)
        .send({ ...validPostBody, email: wrongEmail })
        .expect(404)
        .then((response) => {
          expect(response.body).toHaveProperty("error", "Session not found");
        });

      expect(findSessionHeaders()).toMatchObject({
        "x-hasura-lowcal-email": [wrongEmail],
      });
      expect(callsTo("LockSession")).toBe(0);
      expect(callsTo("CreatePaymentRequest")).toBe(0);
    });

    test("a sessionId that cannot be found", async () => {
      queryMock.mockQuery({
        name: "FindSessionForInvite",
        data: { sessions: [] },
        variables: { sessionId: notFoundSession.id },
      });

      await supertest(app)
        .post(notFoundSessionURL)
        .send(validPostBody)
        .expect(404)
        .then((response) => {
          expect(response.body).toHaveProperty("error", "Session not found");
        });

      expect(callsTo("LockSession")).toBe(0);
    });

    test("a session which is already locked", async () => {
      queryMock.mockQuery(findSessionForInviteQueryMock);
      queryMock.mockQuery({
        ...lockSessionQueryMock,
        data: { update_lowcal_sessions: { returning: [] } },
      });

      await supertest(app)
        .post(validSessionURL)
        .send(validPostBody)
        .expect(409)
        .then((response) => {
          expect(response.body).toHaveProperty(
            "error",
            "Session is already locked",
          );
        });

      expect(callsTo("CreatePaymentRequest")).toBe(0);
    });

    test("a failure to lock the session", async () => {
      queryMock.mockQuery(findSessionForInviteQueryMock);
      queryMock.mockQuery({ name: "LockSession", ...hasuraError });

      await supertest(app)
        .post(validSessionURL)
        .send(validPostBody)
        .expect(500)
        .then((response) => {
          expect(response.body.error).toMatch(/failed to lock session/);
        });

      expect(callsTo("CreatePaymentRequest")).toBe(0);
    });

    test("a failure to create the payment request unlocks the session", async () => {
      queryMock.mockQuery(findSessionForInviteQueryMock);
      queryMock.mockQuery(lockSessionQueryMock);
      queryMock.mockQuery(detailedValidSessionQueryMock);
      queryMock.mockQuery(getPublishedFlowDataQueryMock);
      queryMock.mockQuery({ name: "CreatePaymentRequest", ...hasuraError });
      queryMock.mockQuery(unlockSessionQueryMock);

      await supertest(app)
        .post(validSessionURL)
        .send(validPostBody)
        .expect(500)
        .then((response) => {
          expect(response.body.error).toMatch(
            /could not initiate a payment request/,
          );
        });

      expect(callsTo("LockSession")).toBe(1);
      expect(callsTo("UnlockSession")).toBe(1);
    });
  });
});
