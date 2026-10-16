import type Stripe from "stripe";
import supertest from "supertest";

import app from "../../../server.js";
import { queryMock } from "../../../tests/graphqlQueryMock.js";
import * as payHelpers from "../../pay/helpers.js";
import {
  buildPaymentRequest,
  PAYMENT_REQUEST_ID,
  validBody,
} from "../checkout/test/mocks.js";
import { stripe } from "../client.js";
import { STRIPE_WEBHOOK_ENDPOINT } from "../routes.js";
import { sign } from "../webhook/test/utils.js";

const CHECKOUT_SESSION_ID = "cs_test_itp";
const PAYMENT_INTENT_ID = "pi_test_itp";
const SESSION_ID = validBody.sessionId;
const FULFIL_ENDPOINT = `/stripe/payment-request/${PAYMENT_REQUEST_ID}/fulfil`;

const checkoutSession = (overrides: Record<string, unknown> = {}) => ({
  id: CHECKOUT_SESSION_ID,
  object: "checkout.session",
  status: "complete",
  payment_status: "paid",
  payment_intent: PAYMENT_INTENT_ID,
  metadata: {
    flow: "Apply for planning permission",
    source: "PlanX",
    paidViaInviteToPay: "true",
    sessionId: SESSION_ID,
    origin: "https://api.example.com",
    paymentRequestId: PAYMENT_REQUEST_ID,
  },
  ...overrides,
});

const asCheckoutSession = (value: unknown) =>
  value as unknown as Stripe.Response<Stripe.Checkout.Session>;

const mockRetrieve = (overrides: Record<string, unknown> = {}) =>
  vi
    .spyOn(stripe.checkout.sessions, "retrieve")
    .mockResolvedValue(asCheckoutSession(checkoutSession(overrides)));

const checkoutSessionEvent = (
  type: string,
  objectOverrides: Record<string, unknown> = {},
) =>
  sign({
    id: `evt_${type}`,
    type,
    data: { object: checkoutSession(objectOverrides) },
  });

const postWebhook = ({
  payload,
  signature,
}: {
  payload: string;
  signature: string;
}) =>
  supertest(app)
    .post(STRIPE_WEBHOOK_ENDPOINT)
    .set("Content-Type", "application/json")
    .set("stripe-signature", signature)
    .send(payload);

const postFulfil = (body: Record<string, unknown> = {}) =>
  supertest(app)
    .post(FULFIL_ENDPOINT)
    .send({ checkoutSessionId: CHECKOUT_SESSION_ID, ...body });

/**
 * A stand-in for the payment_requests row, honouring `WHERE paid_at IS NULL`
 * so that idempotency is tested against the mutation's real guard
 */
const mockPaymentRequestRow = (
  overrides: Record<string, unknown> = {},
  sessionOverrides: Record<string, unknown> = {},
) => {
  const row = buildPaymentRequest(overrides, sessionOverrides);
  const db = { paidAt: row.paidAt as string | null, updates: 0 };

  queryMock.mockQuery({
    name: "GetPaymentRequestForCheckout",
    matchOnVariables: false,
    data: {},
    customHandler: () => [
      200,
      { data: { paymentRequest: { ...row, paidAt: db.paidAt } } },
    ],
  });

  queryMock.mockQuery({
    name: "MarkStripePaymentRequestAsPaid",
    matchOnVariables: false,
    data: {},
    customHandler: () => {
      const affectedRows = db.paidAt ? 0 : 1;
      if (affectedRows) {
        db.paidAt = new Date().toISOString();
        db.updates++;
      }
      return [
        200,
        {
          data: {
            paymentRequest: { affectedRows },
            session: { id: SESSION_ID },
          },
        },
      ];
    },
  });

  return db;
};

const mockPaymentRequestNotFound = () =>
  queryMock.mockQuery({
    name: "GetPaymentRequestForCheckout",
    matchOnVariables: false,
    data: { paymentRequest: null },
  });

const getMarkAsPaidCalls = () =>
  queryMock
    .getCalls()
    .filter((call) => call.id === "MarkStripePaymentRequestAsPaid");

const getPaymentRequestLookups = () =>
  queryMock
    .getCalls()
    .filter((call) => call.id === "GetPaymentRequestForCheckout");

describe("fulfilling an invite to pay request", () => {
  beforeEach(() => {
    mockRetrieve();
    vi.spyOn(payHelpers, "reportError");
  });

  afterEach(() => vi.restoreAllMocks());

  describe("via the webhook", () => {
    it("marks the payment request as paid on a checkout.session.completed event, and writes the payment reference into the session", async () => {
      const db = mockPaymentRequestRow();

      await postWebhook(
        checkoutSessionEvent("checkout.session.completed"),
      ).expect(200);

      // Always re-read from Stripe, never trusted from the event payload
      expect(stripe.checkout.sessions.retrieve).toHaveBeenCalledWith(
        CHECKOUT_SESSION_ID,
      );
      expect(db.updates).toBe(1);
      expect(getMarkAsPaidCalls()[0].variables).toEqual({
        paymentRequestId: PAYMENT_REQUEST_ID,
        sessionId: SESSION_ID,
        stripePaymentId: PAYMENT_INTENT_ID,
        sessionData: {
          passport: {
            data: {
              "property.type": ["house.semiDetached"],
              "application.fee.reference.stripe": PAYMENT_INTENT_ID,
            },
          },
        },
      });
    });

    it("only updates once when the same event is delivered twice", async () => {
      const db = mockPaymentRequestRow();
      const event = checkoutSessionEvent("checkout.session.completed");

      await postWebhook(event).expect(200);
      await postWebhook(event).expect(200);

      expect(db.updates).toBe(1);
      expect(getMarkAsPaidCalls()).toHaveLength(1);
    });

    it("accepts an expanded PaymentIntent on the Checkout Session", async () => {
      mockRetrieve({ payment_intent: { id: PAYMENT_INTENT_ID } });
      mockPaymentRequestRow();

      await postWebhook(
        checkoutSessionEvent("checkout.session.completed"),
      ).expect(200);

      expect(getMarkAsPaidCalls()[0].variables).toEqual(
        expect.objectContaining({ stripePaymentId: PAYMENT_INTENT_ID }),
      );
    });

    it("still writes the payment reference when the session has no passport", async () => {
      mockPaymentRequestRow({ session: null });

      await postWebhook(
        checkoutSessionEvent("checkout.session.completed"),
      ).expect(200);

      expect(getMarkAsPaidCalls()[0].variables?.sessionData).toEqual({
        passport: {
          data: { "application.fee.reference.stripe": PAYMENT_INTENT_ID },
        },
      });
    });

    it("does not update an unpaid Checkout Session", async () => {
      mockRetrieve({ payment_status: "unpaid" });
      const db = mockPaymentRequestRow();

      await postWebhook(
        checkoutSessionEvent("checkout.session.completed", {
          payment_status: "unpaid",
        }),
      ).expect(200);

      expect(db.updates).toBe(0);
      expect(getMarkAsPaidCalls()).toHaveLength(0);
    });

    it("ignores a self-pay Checkout Session (no paymentRequestId)", async () => {
      const { paymentRequestId: _, ...selfPayMetadata } =
        checkoutSession().metadata;
      const db = mockPaymentRequestRow();

      await postWebhook(
        checkoutSessionEvent("checkout.session.completed", {
          metadata: selfPayMetadata,
        }),
      ).expect(200);

      expect(stripe.checkout.sessions.retrieve).not.toHaveBeenCalled();
      expect(db.updates).toBe(0);
    });

    it("ignores a Checkout Session created by another environment", async () => {
      const metadata = {
        ...checkoutSession().metadata,
        origin: "https://api.another.example.com",
      };
      mockRetrieve({ metadata });
      mockPaymentRequestRow();

      await postWebhook(
        checkoutSessionEvent("checkout.session.completed", { metadata }),
      ).expect(200);

      expect(getPaymentRequestLookups()).toHaveLength(0);
      expect(getMarkAsPaidCalls()).toHaveLength(0);
      expect(payHelpers.reportError).not.toHaveBeenCalled();
    });

    it("ignores a payment request which doesn't exist in this environment", async () => {
      mockPaymentRequestNotFound();

      await postWebhook(
        checkoutSessionEvent("checkout.session.completed"),
      ).expect(200);

      expect(getMarkAsPaidCalls()).toHaveLength(0);
      expect(payHelpers.reportError).not.toHaveBeenCalled();
    });

    it("refuses, and reports, a Checkout Session for a different session", async () => {
      const db = mockPaymentRequestRow({
        sessionId: "00000000-0000-4000-8000-000000000000",
      });

      await postWebhook(
        checkoutSessionEvent("checkout.session.completed"),
      ).expect(200);

      expect(db.updates).toBe(0);
      expect(payHelpers.reportError).toHaveBeenCalledWith(
        expect.objectContaining({
          context: {
            checkoutSessionId: CHECKOUT_SESSION_ID,
            eventType: "checkout.session.completed",
          },
        }),
      );
    });

    it("refuses, and reports, a Checkout Session with invalid reserved metadata", async () => {
      const metadata = { paymentRequestId: PAYMENT_REQUEST_ID };
      mockRetrieve({ metadata });
      const db = mockPaymentRequestRow();

      await postWebhook(
        checkoutSessionEvent("checkout.session.completed", { metadata }),
      ).expect(200);

      expect(db.updates).toBe(0);
      expect(payHelpers.reportError).toHaveBeenCalled();
    });

    it("returns 500 when retrieving the Checkout Session fails, so Stripe redelivers the event", async () => {
      vi.spyOn(stripe.checkout.sessions, "retrieve").mockRejectedValue(
        new Error("Stripe is unreachable"),
      );
      const db = mockPaymentRequestRow();

      await postWebhook(
        checkoutSessionEvent("checkout.session.completed"),
      ).expect(500);

      expect(db.updates).toBe(0);
    });

    it("returns 500 when marking the payment request as paid fails", async () => {
      mockPaymentRequestRow();
      queryMock.mockQuery({
        name: "MarkStripePaymentRequestAsPaid",
        matchOnVariables: false,
        status: 500,
        data: {},
      });

      await postWebhook(
        checkoutSessionEvent("checkout.session.completed"),
      ).expect(500);

      expect(payHelpers.reportError).toHaveBeenCalledWith(
        expect.objectContaining({
          context: expect.objectContaining({
            eventType: "checkout.session.completed",
          }),
        }),
      );
    });

    it("returns 500 when a paid Checkout Session has no PaymentIntent", async () => {
      mockRetrieve({ payment_intent: null });
      const db = mockPaymentRequestRow();

      await postWebhook(
        checkoutSessionEvent("checkout.session.completed"),
      ).expect(500);

      expect(db.updates).toBe(0);
    });
  });

  describe("via the payer's return page", () => {
    it("marks the payment request as paid", async () => {
      const db = mockPaymentRequestRow();

      await postFulfil()
        .expect(200)
        .then((res) => expect(res.body).toEqual({ paymentStatus: "paid" }));

      expect(stripe.checkout.sessions.retrieve).toHaveBeenCalledWith(
        CHECKOUT_SESSION_ID,
      );
      expect(db.updates).toBe(1);
    });

    it("responds 'paid' without updating when the request has already been paid", async () => {
      const db = mockPaymentRequestRow({
        paidAt: new Date().toISOString(),
      });

      await postFulfil()
        .expect(200)
        .then((res) => expect(res.body).toEqual({ paymentStatus: "paid" }));

      expect(db.updates).toBe(0);
      expect(getMarkAsPaidCalls()).toHaveLength(0);
    });

    it("refuses a Checkout Session which hasn't been paid", async () => {
      mockRetrieve({ status: "open", payment_status: "unpaid" });
      const db = mockPaymentRequestRow();

      await postFulfil().expect(409);

      expect(db.updates).toBe(0);
    });

    it("refuses a Checkout Session for a different payment request", async () => {
      mockRetrieve({
        metadata: {
          ...checkoutSession().metadata,
          paymentRequestId: "00000000-0000-4000-8000-000000000000",
        },
      });
      const db = mockPaymentRequestRow();

      await postFulfil().expect(400);

      expect(getPaymentRequestLookups()).toHaveLength(0);
      expect(db.updates).toBe(0);
    });

    it("refuses a Checkout Session for a different session", async () => {
      const db = mockPaymentRequestRow({
        sessionId: "00000000-0000-4000-8000-000000000000",
      });

      await postFulfil().expect(400);

      expect(db.updates).toBe(0);
    });

    it("refuses a self-pay Checkout Session", async () => {
      const { paymentRequestId: _, ...selfPayMetadata } =
        checkoutSession().metadata;
      mockRetrieve({ metadata: selfPayMetadata });
      const db = mockPaymentRequestRow();

      await postFulfil().expect(400);

      expect(db.updates).toBe(0);
    });

    it("refuses a Checkout Session created by another environment", async () => {
      mockRetrieve({
        metadata: {
          ...checkoutSession().metadata,
          origin: "https://api.another.example.com",
        },
      });
      const db = mockPaymentRequestRow();

      await postFulfil().expect(400);

      expect(db.updates).toBe(0);
    });

    it("returns 404 when the payment request does not exist", async () => {
      mockPaymentRequestNotFound();

      await postFulfil().expect(404);

      expect(getMarkAsPaidCalls()).toHaveLength(0);
    });

    it("returns 500 when retrieving the Checkout Session fails", async () => {
      vi.spyOn(stripe.checkout.sessions, "retrieve").mockRejectedValue(
        new Error("Stripe is unreachable"),
      );
      const db = mockPaymentRequestRow();

      await postFulfil().expect(500);

      expect(db.updates).toBe(0);
    });

    it.each([
      { checkoutSessionId: undefined },
      { checkoutSessionId: "pi_not_a_checkout_session" },
    ])("rejects an invalid body (%o)", async (body) => {
      await postFulfil(body).expect(400);

      expect(stripe.checkout.sessions.retrieve).not.toHaveBeenCalled();
    });

    it("rejects an invalid payment request id", async () => {
      await supertest(app)
        .post("/stripe/payment-request/not-a-uuid/fulfil")
        .send({ checkoutSessionId: CHECKOUT_SESSION_ID })
        .expect(400);

      expect(stripe.checkout.sessions.retrieve).not.toHaveBeenCalled();
    });
  });

  it("only updates once when the webhook and the return page race", async () => {
    const db = mockPaymentRequestRow();

    const [webhook, returnPage] = await Promise.all([
      postWebhook(checkoutSessionEvent("checkout.session.completed")),
      postFulfil(),
    ]);

    expect(webhook.status).toBe(200);
    expect(returnPage.status).toBe(200);
    expect(returnPage.body).toEqual({ paymentStatus: "paid" });
    expect(db.updates).toBe(1);
  });

  it("succeeds without updating when a concurrent call marks the request as paid first", async () => {
    const db = mockPaymentRequestRow();
    // The row is read as unpaid, but has been paid by the time the mutation runs
    queryMock.mockQuery({
      name: "GetPaymentRequestForCheckout",
      matchOnVariables: false,
      data: { paymentRequest: buildPaymentRequest() },
    });
    db.paidAt = new Date().toISOString();

    await postFulfil()
      .expect(200)
      .then((res) => expect(res.body).toEqual({ paymentStatus: "paid" }));

    expect(getMarkAsPaidCalls()).toHaveLength(1);
    expect(db.updates).toBe(0);
  });
});
