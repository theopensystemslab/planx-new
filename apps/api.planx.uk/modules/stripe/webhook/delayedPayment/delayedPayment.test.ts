import type Stripe from "stripe";
import supertest from "supertest";

import app from "../../../../server.js";
import { queryMock } from "../../../../tests/graphqlQueryMock.js";
import * as payHelpers from "../../../pay/helpers.js";
import * as sendEvents from "../../../pay/service/inviteToPay/createPaymentSendEvents.js";
import { STRIPE_WEBHOOK_ENDPOINT } from "../../routes.js";
import { sign } from "../test/utils.js";
import {
  isDelayedPaymentPending,
  markDelayedPaymentPending,
} from "./service.js";

const SESSION_ID = "f2d8ca1d-a43b-43ec-b3d9-a9fec63ff19c";

const checkoutSession = (
  overrides: Partial<Stripe.Checkout.Session> = {},
): Stripe.Checkout.Session =>
  ({
    id: "cs_test_bacs",
    object: "checkout.session",
    status: "complete",
    payment_status: "unpaid",
    payment_intent: "pi_test_bacs",
    metadata: { sessionId: SESSION_ID, origin: process.env.API_URL_EXT },
    ...overrides,
  }) as Stripe.Checkout.Session;

const mockMarkPending = ({ started = 1, locked = 1 } = {}) =>
  queryMock.mockQuery({
    name: "MarkDelayedPaymentPending",
    matchOnVariables: false,
    data: {
      started: { affectedRows: started },
      locked: { affectedRows: locked },
    },
  });

const post = ({ payload, signature }: ReturnType<typeof sign>) =>
  supertest(app)
    .post(STRIPE_WEBHOOK_ENDPOINT)
    .set("Content-Type", "application/json")
    .set("stripe-signature", signature)
    .send(payload);

const markPendingCalls = () =>
  queryMock
    .getCalls()
    .filter((call) => call.id === "MarkDelayedPaymentPending");

describe("isDelayedPaymentPending", () => {
  it("is true when Checkout is complete but the payment hasn't been confirmed", () => {
    expect(isDelayedPaymentPending(checkoutSession())).toBe(true);
  });

  it.each([
    ["paid (card, Pay by bank)", { payment_status: "paid" }],
    ["still open", { status: "open" }],
    ["expired", { status: "expired" }],
  ] as const)("is false when the Checkout Session is %s", (_, overrides) => {
    expect(isDelayedPaymentPending(checkoutSession(overrides))).toBe(false);
  });
});

describe("marking a delayed payment (e.g. Bacs) as pending", () => {
  beforeEach(() => {
    queryMock.reset();
    mockMarkPending();
  });

  it("locks the session and records when the delayed payment started", async () => {
    await markDelayedPaymentPending(checkoutSession());

    expect(markPendingCalls()).toHaveLength(1);
    expect(markPendingCalls()[0].variables).toEqual({ sessionId: SESSION_ID });
  });

  it("is safe to repeat, once the session is already locked", async () => {
    mockMarkPending({ started: 0, locked: 0 });

    await expect(
      markDelayedPaymentPending(checkoutSession()),
    ).resolves.toBeUndefined();
  });

  it("does nothing for an invite to pay Checkout Session, as the session is already locked", async () => {
    await markDelayedPaymentPending(
      checkoutSession({
        metadata: {
          sessionId: SESSION_ID,
          origin: process.env.API_URL_EXT!,
          paymentRequestId: "0d6b1a4e-58a6-4b3e-9f0a-3c2d1b0a9e8f",
        },
      }),
    );

    expect(markPendingCalls()).toHaveLength(0);
  });

  it("does nothing for a Checkout Session created by another environment", async () => {
    await markDelayedPaymentPending(
      checkoutSession({
        metadata: { sessionId: SESSION_ID, origin: "https://api.other.env" },
      }),
    );

    expect(markPendingCalls()).toHaveLength(0);
  });

  it("does nothing when the Checkout Session has no PlanX metadata", async () => {
    await markDelayedPaymentPending(checkoutSession({ metadata: {} }));

    expect(markPendingCalls()).toHaveLength(0);
  });

  it("throws when the update fails", async () => {
    queryMock.mockQuery({
      name: "MarkDelayedPaymentPending",
      matchOnVariables: false,
      data: {},
      graphqlErrors: [{ message: "Hasura is down" }],
    });

    await expect(
      markDelayedPaymentPending(checkoutSession()),
    ).rejects.toThrow();
  });

  describe("via the webhook", () => {
    const completedEvent = (overrides: Partial<Stripe.Checkout.Session> = {}) =>
      sign({
        id: "evt_checkout_completed",
        type: "checkout.session.completed",
        data: { object: checkoutSession(overrides) },
      });

    it("locks a self-pay session on checkout.session.completed, in case the applicant doesn't return to PlanX", async () => {
      await post(completedEvent()).expect(200);

      expect(markPendingCalls()).toHaveLength(1);
    });

    it("does nothing for a paid self-pay session, which the applicant's browser submits", async () => {
      await post(completedEvent({ payment_status: "paid" })).expect(200);

      expect(markPendingCalls()).toHaveLength(0);
    });

    it("returns 500 when locking fails, so Stripe redelivers the event", async () => {
      queryMock.mockQuery({
        name: "MarkDelayedPaymentPending",
        matchOnVariables: false,
        data: {},
        graphqlErrors: [{ message: "Hasura is down" }],
      });

      await post(completedEvent()).expect(500);
    });
  });
});

describe("submitting once a delayed payment (e.g. Bacs) succeeds", () => {
  const ENDPOINT = "/webhooks/hasura/create-delayed-payment-send-events";
  const PASSPORT = { data: { "application.type": ["ldc"] } };

  const postEvent = ({
    payload = {},
    currentRetry = 0,
  }: {
    payload?: Record<string, unknown>;
    currentRetry?: number;
  } = {}) =>
    supertest(app)
      .post(ENDPOINT)
      .set({ Authorization: process.env.HASURA_PLANX_API_KEY! })
      .send({
        payload: {
          sessionId: SESSION_ID,
          stripePaymentId: "pi_test_bacs",
          stripeStatus: "succeeded",
          paymentMethod: "bacs_debit",
          ...payload,
        },
        deliveryInfo: { currentRetry, maxRetries: 5 },
      });

  const mockSession = (overrides: Record<string, unknown> = {}) =>
    queryMock.mockQuery({
      name: "GetDelayedPaymentSession",
      matchOnVariables: false,
      data: {
        session: {
          passport: PASSPORT,
          submittedAt: null,
          deletedAt: null,
          paymentRequests: [],
          flow: { team: { slug: "southwark" } },
          ...overrides,
        },
      },
    });

  const mockWriteReference = (affectedRows = 1) =>
    queryMock.mockQuery({
      name: "WriteDelayedPaymentReference",
      matchOnVariables: false,
      data: { session: { affectedRows } },
    });

  const writeReferenceCalls = () =>
    queryMock
      .getCalls()
      .filter((call) => call.id === "WriteDelayedPaymentReference");

  const getSessionCalls = () =>
    queryMock
      .getCalls()
      .filter((call) => call.id === "GetDelayedPaymentSession");

  beforeEach(() => {
    queryMock.reset();
    mockSession();
    mockWriteReference();
    vi.spyOn(payHelpers, "reportError");
    vi.spyOn(sendEvents, "createPaymentSendEventsForSession").mockResolvedValue(
      {},
    );
  });

  afterEach(() => vi.restoreAllMocks());

  it("writes the payment reference into the passport, then submits the application", async () => {
    await postEvent()
      .expect(200)
      .then((res) => expect(res.body.message).toMatch(/submitted/));

    expect(writeReferenceCalls()).toHaveLength(1);
    expect(writeReferenceCalls()[0].variables).toEqual({
      sessionId: SESSION_ID,
      sessionData: {
        passport: {
          data: {
            ...PASSPORT.data,
            "application.fee.reference.stripe": "pi_test_bacs",
          },
        },
      },
    });
    expect(sendEvents.createPaymentSendEventsForSession).toHaveBeenCalledWith(
      SESSION_ID,
    );
    expect(payHelpers.reportError).not.toHaveBeenCalled();
  });

  it.each([
    ["processing", { stripeStatus: "processing" }],
    ["payment_failed", { stripeStatus: "payment_failed" }],
  ])("does nothing for a %s payment", async (_, payload) => {
    await postEvent({ payload }).expect(200);

    expect(getSessionCalls()).toHaveLength(0);
    expect(sendEvents.createPaymentSendEventsForSession).not.toHaveBeenCalled();
  });

  it.each([
    ["card", { paymentMethod: "card" }],
    ["unknown payment method", { paymentMethod: null }],
  ])(
    "does nothing for a payment made at checkout (%s), which the applicant's browser submits",
    async (_, payload) => {
      await postEvent({ payload }).expect(200);

      expect(getSessionCalls()).toHaveLength(0);
      expect(
        sendEvents.createPaymentSendEventsForSession,
      ).not.toHaveBeenCalled();
    },
  );

  it("does nothing for a row without a Stripe payment (e.g. GOV.UK Pay)", async () => {
    await postEvent({
      payload: { stripePaymentId: null, stripeStatus: null },
    }).expect(200);

    expect(getSessionCalls()).toHaveLength(0);
  });

  it("does nothing for invite to pay, which is submitted when the payment request is paid", async () => {
    mockSession({ paymentRequests: [{ id: "payment-request-id" }] });

    await postEvent()
      .expect(200)
      .then((res) => expect(res.body.message).toMatch(/inviteToPay/));

    expect(writeReferenceCalls()).toHaveLength(0);
    expect(sendEvents.createPaymentSendEventsForSession).not.toHaveBeenCalled();
  });

  it("reports an error, without submitting, when the session expired while the payment was processing", async () => {
    mockSession({ deletedAt: "2026-11-11T09:00:00Z" });

    await postEvent().expect(200);

    expect(sendEvents.createPaymentSendEventsForSession).not.toHaveBeenCalled();
    expect(payHelpers.reportError).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.stringContaining("has expired"),
      }),
    );
  });

  it("reports an error, without submitting, when the session was already submitted, as the applicant may have paid twice", async () => {
    mockSession({ submittedAt: "2026-11-11T09:00:00Z" });

    await postEvent().expect(200);

    expect(sendEvents.createPaymentSendEventsForSession).not.toHaveBeenCalled();
    expect(payHelpers.reportError).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.stringContaining("may have paid twice"),
      }),
    );
  });

  it("carries on submitting on a retry, when a previous attempt has already submitted to some destinations", async () => {
    mockSession({ submittedAt: "2026-11-11T09:00:00Z" });

    await postEvent({ currentRetry: 1 }).expect(200);

    expect(sendEvents.createPaymentSendEventsForSession).toHaveBeenCalledWith(
      SESSION_ID,
    );
    expect(payHelpers.reportError).not.toHaveBeenCalled();
  });

  it("reports an error when the session can't be found", async () => {
    queryMock.mockQuery({
      name: "GetDelayedPaymentSession",
      matchOnVariables: false,
      data: { session: null },
    });

    await postEvent().expect(200);

    expect(sendEvents.createPaymentSendEventsForSession).not.toHaveBeenCalled();
    expect(payHelpers.reportError).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.stringContaining("was not found"),
      }),
    );
  });

  it("returns 500, without submitting, when the session was deleted before the reference was written, so Hasura retries", async () => {
    mockWriteReference(0);

    await postEvent().expect(500);

    expect(sendEvents.createPaymentSendEventsForSession).not.toHaveBeenCalled();
  });

  it("returns 500 when the send events can't be created, so Hasura retries", async () => {
    vi.mocked(sendEvents.createPaymentSendEventsForSession).mockRejectedValue(
      new Error("Hasura is down"),
    );

    await postEvent()
      .expect(500)
      .then((res) =>
        expect(res.body.error).toMatch(/needs following up manually/),
      );
  });

  it("returns 400 for an invalid payload", async () => {
    await supertest(app)
      .post(ENDPOINT)
      .set({ Authorization: process.env.HASURA_PLANX_API_KEY! })
      .send({ payload: { sessionId: "not-a-uuid" } })
      .expect(400);
  });

  it("does nothing when Stripe sends checkout.session.async_payment_succeeded for a self-pay session", async () => {
    await post(
      sign({
        id: "evt_async_payment_succeeded",
        type: "checkout.session.async_payment_succeeded",
        data: { object: checkoutSession({ payment_status: "paid" }) },
      }),
    ).expect(200);

    expect(queryMock.getCalls()).toHaveLength(0);
    expect(sendEvents.createPaymentSendEventsForSession).not.toHaveBeenCalled();
  });
});
