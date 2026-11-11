import type Stripe from "stripe";
import supertest from "supertest";

import app from "../../../../server.js";
import { queryMock } from "../../../../tests/graphqlQueryMock.js";
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

    const post = ({ payload, signature }: ReturnType<typeof sign>) =>
      supertest(app)
        .post(STRIPE_WEBHOOK_ENDPOINT)
        .set("Content-Type", "application/json")
        .set("stripe-signature", signature)
        .send(payload);

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
