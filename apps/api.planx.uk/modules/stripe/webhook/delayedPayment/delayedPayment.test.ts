import type Stripe from "stripe";
import supertest from "supertest";

import app from "../../../../server.js";
import { queryMock } from "../../../../tests/graphqlQueryMock.js";
import * as payHelpers from "../../../pay/helpers.js";
import * as stripeHelpers from "../../helpers.js";
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
  const PASSPORT = { data: { "application.type": ["ldc"] } };

  const succeededEvent = (overrides: Partial<Stripe.Checkout.Session> = {}) =>
    sign({
      id: "evt_async_payment_succeeded",
      type: "checkout.session.async_payment_succeeded",
      data: {
        object: checkoutSession({ payment_status: "paid", ...overrides }),
      },
    });

  const mockSession = (overrides: Record<string, unknown> = {}) =>
    queryMock.mockQuery({
      name: "GetDelayedPaymentSession",
      matchOnVariables: false,
      data: {
        session: {
          passport: PASSPORT,
          paidAt: null,
          submittedAt: null,
          deletedAt: null,
          flow: { team: { slug: "southwark" } },
          ...overrides,
        },
      },
    });

  const mockMarkAsPaid = (affectedRows = 1) =>
    queryMock.mockQuery({
      name: "MarkSessionAsPaid",
      matchOnVariables: false,
      data: { session: { affectedRows } },
    });

  const markAsPaidCalls = () =>
    queryMock.getCalls().filter((call) => call.id === "MarkSessionAsPaid");

  beforeEach(() => {
    queryMock.reset();
    mockSession();
    mockMarkAsPaid();
    vi.spyOn(stripeHelpers, "alertPlanX").mockResolvedValue();
    vi.spyOn(payHelpers, "reportError");
  });

  afterEach(() => vi.restoreAllMocks());

  it("sets paid_at and writes the payment reference into the passport, which submits the application", async () => {
    await post(succeededEvent()).expect(200);

    expect(markAsPaidCalls()).toHaveLength(1);
    expect(markAsPaidCalls()[0].variables).toEqual({
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
    expect(stripeHelpers.alertPlanX).not.toHaveBeenCalled();
  });

  it("does nothing when the session has already been paid (e.g. a redelivered event)", async () => {
    mockSession({ paidAt: "2026-11-11T09:00:00Z" });

    await post(succeededEvent()).expect(200);

    expect(markAsPaidCalls()).toHaveLength(0);
  });

  it("alerts PlanX, without submitting, when the session expired while the payment was processing", async () => {
    mockSession({ deletedAt: "2026-11-11T09:00:00Z" });

    await post(succeededEvent()).expect(200);

    expect(markAsPaidCalls()).toHaveLength(0);
    expect(stripeHelpers.alertPlanX).toHaveBeenCalledWith(
      expect.stringContaining("has expired"),
    );
  });

  it("alerts PlanX when the session has already been submitted, as the applicant may have paid twice", async () => {
    mockSession({ submittedAt: "2026-11-11T09:00:00Z" });

    await post(succeededEvent()).expect(200);

    expect(markAsPaidCalls()).toHaveLength(0);
    expect(stripeHelpers.alertPlanX).toHaveBeenCalledWith(
      expect.stringContaining("may have paid twice"),
    );
  });

  it("does nothing when the session isn't in this environment", async () => {
    queryMock.mockQuery({
      name: "GetDelayedPaymentSession",
      matchOnVariables: false,
      data: { session: null },
    });

    await post(succeededEvent()).expect(200);

    expect(markAsPaidCalls()).toHaveLength(0);
  });

  it("does nothing for a Checkout Session created by another environment", async () => {
    await post(
      succeededEvent({
        metadata: { sessionId: SESSION_ID, origin: "https://api.other.env" },
      }),
    ).expect(200);

    expect(
      queryMock
        .getCalls()
        .filter((call) => call.id === "GetDelayedPaymentSession"),
    ).toHaveLength(0);
  });

  it("reports an error, without submitting, when the Checkout Session isn't paid", async () => {
    await post(succeededEvent({ payment_status: "unpaid" })).expect(200);

    expect(markAsPaidCalls()).toHaveLength(0);
    expect(payHelpers.reportError).toHaveBeenCalled();
  });

  it("returns 500 when the update fails, so Stripe redelivers the event", async () => {
    queryMock.mockQuery({
      name: "MarkSessionAsPaid",
      matchOnVariables: false,
      data: {},
      graphqlErrors: [{ message: "Hasura is down" }],
    });

    await post(succeededEvent()).expect(500);
  });
});
