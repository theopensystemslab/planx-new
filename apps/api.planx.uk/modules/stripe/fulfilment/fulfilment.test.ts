import Stripe from "stripe";
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
/** Paid via another Checkout Session (e.g. in a second tab) */
const OTHER_PAYMENT_INTENT_ID = "pi_test_other_tab";
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

const mockPaymentRequestRow = (
  overrides: Record<string, unknown> = {},
  sessionOverrides: Record<string, unknown> = {},
) => {
  queryMock.mockQuery({
    name: "GetPaymentRequestForCheckout",
    matchOnVariables: false,
    data: { paymentRequest: buildPaymentRequest(overrides, sessionOverrides) },
  });
  mockMarkAsPaid();
};

let markAsPaidQuery = "";

/**
 * @param affectedRows 0 when a concurrent call has already marked the request as paid
 */
const mockMarkAsPaid = (affectedRows = 1) =>
  queryMock.mockQuery({
    name: "MarkStripePaymentRequestAsPaid",
    matchOnVariables: false,
    data: {},
    customHandler: (_req, { query }) => {
      markAsPaidQuery = query.replace(/\s+/g, " ");
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

const mockPaymentRequestNotFound = () =>
  queryMock.mockQuery({
    name: "GetPaymentRequestForCheckout",
    matchOnVariables: false,
    data: { paymentRequest: null },
  });

/**
 * A concurrent call marks the request as paid between this call's lookup and update
 *
 * @param paidRequest the payment request when re-read after the update
 */
const mockPaidConcurrently = (paidRequest: unknown) => {
  queryMock.mockQuery({
    name: "GetPaymentRequestForCheckout",
    matchOnVariables: false,
    data: { paymentRequest: paidRequest },
  });
  // The latest mock answers the first lookup, then is used up
  queryMock.mockQuery({
    name: "GetPaymentRequestForCheckout",
    matchOnVariables: false,
    persist: false,
    data: { paymentRequest: buildPaymentRequest() },
  });
  mockMarkAsPaid(0);
};

const getMarkAsPaidCalls = () =>
  queryMock
    .getCalls()
    .filter((call) => call.id === "MarkStripePaymentRequestAsPaid");

const getPaymentRequestLookups = () =>
  queryMock
    .getCalls()
    .filter((call) => call.id === "GetPaymentRequestForCheckout");

const expectReported = (status: string) =>
  expect(payHelpers.reportError).toHaveBeenCalledWith(
    expect.objectContaining({
      error: expect.stringContaining(`(${status})`),
      context: {
        checkoutSessionId: CHECKOUT_SESSION_ID,
        eventType: "checkout.session.completed",
      },
    }),
  );

describe("fulfilling an invite to pay request", () => {
  beforeEach(() => {
    mockRetrieve();
    vi.spyOn(payHelpers, "reportError");
  });

  afterEach(() => vi.restoreAllMocks());

  describe("via the webhook", () => {
    it("marks the payment request as paid on a checkout.session.completed event, and writes the payment reference into the session", async () => {
      mockPaymentRequestRow();

      await postWebhook(
        checkoutSessionEvent("checkout.session.completed"),
      ).expect(200);

      // Always re-read from Stripe, never trusted from the event payload
      expect(stripe.checkout.sessions.retrieve).toHaveBeenCalledWith(
        CHECKOUT_SESSION_ID,
      );
      expect(getMarkAsPaidCalls()).toHaveLength(1);
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

    it("guards the update so the request is only paid once", async () => {
      mockPaymentRequestRow();

      await postWebhook(
        checkoutSessionEvent("checkout.session.completed"),
      ).expect(200);

      expect(markAsPaidQuery).toContain(
        "update_payment_requests( where: { id: { _eq: $paymentRequestId } paid_at: { _is_null: true } }",
      );
    });

    it("only updates once when the same event is delivered twice", async () => {
      const event = checkoutSessionEvent("checkout.session.completed");

      mockPaymentRequestRow();
      await postWebhook(event).expect(200);

      // By the time of redelivery, the request has been paid
      mockPaymentRequestRow({
        paidAt: new Date().toISOString(),
        stripePaymentId: PAYMENT_INTENT_ID,
      });
      await postWebhook(event).expect(200);

      expect(getMarkAsPaidCalls()).toHaveLength(1);
      expect(payHelpers.reportError).not.toHaveBeenCalled();
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
      mockPaymentRequestRow({}, { passport: null });

      await postWebhook(
        checkoutSessionEvent("checkout.session.completed"),
      ).expect(200);

      expect(getMarkAsPaidCalls()[0].variables?.sessionData).toEqual({
        passport: {
          data: { "application.fee.reference.stripe": PAYMENT_INTENT_ID },
        },
      });
    });

    it("reports, and does not update, an unpaid Checkout Session", async () => {
      mockRetrieve({ payment_status: "unpaid" });
      mockPaymentRequestRow();

      await postWebhook(
        checkoutSessionEvent("checkout.session.completed", {
          payment_status: "unpaid",
        }),
      ).expect(200);

      expect(getMarkAsPaidCalls()).toHaveLength(0);
      expectReported("unpaid");
    });

    it("ignores a self-pay Checkout Session (no paymentRequestId)", async () => {
      const { paymentRequestId: _, ...selfPayMetadata } =
        checkoutSession().metadata;
      mockPaymentRequestRow();

      await postWebhook(
        checkoutSessionEvent("checkout.session.completed", {
          metadata: selfPayMetadata,
        }),
      ).expect(200);

      expect(stripe.checkout.sessions.retrieve).not.toHaveBeenCalled();
      expect(getMarkAsPaidCalls()).toHaveLength(0);
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

    it("reports a payment request which doesn't exist in this environment", async () => {
      mockPaymentRequestNotFound();

      await postWebhook(
        checkoutSessionEvent("checkout.session.completed"),
      ).expect(200);

      expect(getMarkAsPaidCalls()).toHaveLength(0);
      expectReported("notFound");
    });

    it("reports, and does not update, a payment request whose session no longer exists", async () => {
      mockPaymentRequestRow({ session: null });

      await postWebhook(
        checkoutSessionEvent("checkout.session.completed"),
      ).expect(200);

      expect(getMarkAsPaidCalls()).toHaveLength(0);
      expectReported("notFound");
    });

    it("refuses, and reports, a Checkout Session for a different session", async () => {
      mockPaymentRequestRow({
        sessionId: "00000000-0000-4000-8000-000000000000",
      });

      await postWebhook(
        checkoutSessionEvent("checkout.session.completed"),
      ).expect(200);

      expect(getMarkAsPaidCalls()).toHaveLength(0);
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
      mockPaymentRequestRow();

      await postWebhook(
        checkoutSessionEvent("checkout.session.completed", { metadata }),
      ).expect(200);

      expect(getMarkAsPaidCalls()).toHaveLength(0);
      expect(payHelpers.reportError).toHaveBeenCalled();
    });

    it("returns 500 when retrieving the Checkout Session fails, so Stripe redelivers the event", async () => {
      vi.spyOn(stripe.checkout.sessions, "retrieve").mockRejectedValue(
        new Error("Stripe is unreachable"),
      );
      mockPaymentRequestRow();

      await postWebhook(
        checkoutSessionEvent("checkout.session.completed"),
      ).expect(500);

      expect(getMarkAsPaidCalls()).toHaveLength(0);
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
      mockPaymentRequestRow();

      await postWebhook(
        checkoutSessionEvent("checkout.session.completed"),
      ).expect(500);

      expect(getMarkAsPaidCalls()).toHaveLength(0);
    });
  });

  describe("via the payer's return page", () => {
    it("marks the payment request as paid, and responds with the payment reference", async () => {
      mockPaymentRequestRow();

      await postFulfil()
        .expect(200)
        .then((res) =>
          expect(res.body).toEqual({
            paymentStatus: "paid",
            paymentIntentId: PAYMENT_INTENT_ID,
          }),
        );

      expect(stripe.checkout.sessions.retrieve).toHaveBeenCalledWith(
        CHECKOUT_SESSION_ID,
      );
      expect(getMarkAsPaidCalls()).toHaveLength(1);
    });

    it("responds 'paid' with the stored payment reference, without updating, when the request has already been paid", async () => {
      // e.g. paid via a Checkout Session in another tab
      mockPaymentRequestRow({
        paidAt: new Date().toISOString(),
        stripePaymentId: OTHER_PAYMENT_INTENT_ID,
      });

      await postFulfil()
        .expect(200)
        .then((res) =>
          expect(res.body).toEqual({
            paymentStatus: "paid",
            paymentIntentId: OTHER_PAYMENT_INTENT_ID,
          }),
        );

      expect(getMarkAsPaidCalls()).toHaveLength(0);
    });

    it("responds 'paid' without a payment reference when the request has already been paid without Stripe", async () => {
      mockPaymentRequestRow({
        paidAt: new Date().toISOString(),
        govPayPaymentId: "govpay_123",
      });

      await postFulfil()
        .expect(200)
        .then((res) =>
          expect(res.body).toEqual({
            paymentStatus: "paid",
            paymentIntentId: null,
          }),
        );

      expect(getMarkAsPaidCalls()).toHaveLength(0);
    });

    it("refuses a Checkout Session which hasn't been paid", async () => {
      mockRetrieve({ status: "open", payment_status: "unpaid" });
      mockPaymentRequestRow();

      await postFulfil().expect(409);

      expect(getMarkAsPaidCalls()).toHaveLength(0);
    });

    it("refuses a Checkout Session for a different payment request", async () => {
      mockRetrieve({
        metadata: {
          ...checkoutSession().metadata,
          paymentRequestId: "00000000-0000-4000-8000-000000000000",
        },
      });
      mockPaymentRequestRow();

      await postFulfil().expect(400);

      expect(getPaymentRequestLookups()).toHaveLength(0);
      expect(getMarkAsPaidCalls()).toHaveLength(0);
    });

    it("refuses a Checkout Session for a different session", async () => {
      mockPaymentRequestRow({
        sessionId: "00000000-0000-4000-8000-000000000000",
      });

      await postFulfil().expect(400);

      expect(getMarkAsPaidCalls()).toHaveLength(0);
    });

    it("refuses a self-pay Checkout Session", async () => {
      const { paymentRequestId: _, ...selfPayMetadata } =
        checkoutSession().metadata;
      mockRetrieve({ metadata: selfPayMetadata });
      mockPaymentRequestRow();

      await postFulfil().expect(400);

      expect(getMarkAsPaidCalls()).toHaveLength(0);
    });

    it("refuses a Checkout Session created by another environment", async () => {
      mockRetrieve({
        metadata: {
          ...checkoutSession().metadata,
          origin: "https://api.another.example.com",
        },
      });
      mockPaymentRequestRow();

      await postFulfil().expect(400);

      expect(getMarkAsPaidCalls()).toHaveLength(0);
    });

    it("returns 404 when the payment request does not exist", async () => {
      mockPaymentRequestNotFound();

      await postFulfil().expect(404);

      expect(getMarkAsPaidCalls()).toHaveLength(0);
    });

    it("returns 404, without updating, when the payment request's session no longer exists", async () => {
      mockPaymentRequestRow({ session: null });

      await postFulfil().expect(404);

      expect(getMarkAsPaidCalls()).toHaveLength(0);
    });

    it("returns 404 when Stripe has no such Checkout Session", async () => {
      vi.spyOn(stripe.checkout.sessions, "retrieve").mockRejectedValue(
        new Stripe.errors.StripeInvalidRequestError({
          type: "invalid_request_error",
          code: "resource_missing",
          message: `No such checkout.session: '${CHECKOUT_SESSION_ID}'`,
        }),
      );

      await postFulfil()
        .expect(404)
        .then((res) =>
          expect(res.body.error).toMatch(/Checkout Session .* not found/),
        );
    });

    it("returns 500 when Stripe rejects the request for another reason", async () => {
      vi.spyOn(stripe.checkout.sessions, "retrieve").mockRejectedValue(
        new Stripe.errors.StripeInvalidRequestError({
          type: "invalid_request_error",
          code: "parameter_invalid_string",
          message: "Invalid string",
        }),
      );

      await postFulfil()
        .expect(500)
        .then((res) => expect(res.body.error).toMatch(/Failed to fulfil/));
    });

    it("returns 500 when retrieving the Checkout Session fails", async () => {
      vi.spyOn(stripe.checkout.sessions, "retrieve").mockRejectedValue(
        new Error("Stripe is unreachable"),
      );
      mockPaymentRequestRow();

      await postFulfil().expect(500);

      expect(getMarkAsPaidCalls()).toHaveLength(0);
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

  describe("when a concurrent call has already marked the request as paid", () => {
    it("responds 'paid' with the stored payment reference, without reporting", async () => {
      mockPaidConcurrently(
        buildPaymentRequest({
          paidAt: new Date().toISOString(),
          stripePaymentId: OTHER_PAYMENT_INTENT_ID,
        }),
      );

      await postFulfil()
        .expect(200)
        .then((res) =>
          expect(res.body).toEqual({
            paymentStatus: "paid",
            paymentIntentId: OTHER_PAYMENT_INTENT_ID,
          }),
        );

      expect(getPaymentRequestLookups()).toHaveLength(2);
      expect(getMarkAsPaidCalls()).toHaveLength(1);
      expect(payHelpers.reportError).not.toHaveBeenCalled();
    });

    it("returns 404 when the payment request no longer exists", async () => {
      mockPaidConcurrently(null);

      await postFulfil().expect(404);

      expect(getPaymentRequestLookups()).toHaveLength(2);
    });
  });
});
