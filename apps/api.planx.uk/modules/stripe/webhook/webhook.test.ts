import type Stripe from "stripe";
import supertest from "supertest";

import app from "../../../server.js";
import { stripe } from "../client.js";
import { STRIPE_WEBHOOK_ENDPOINT } from "../routes.js";
import {
  CONNECTED_ACCOUNT_ID,
  DESTINATION_PAYMENT_ID,
  expandedPaymentIntent,
  getPaymentStatusInsert as insertCall,
  mockPassportLookup,
  mockPassportLookupFailure,
  mockPaymentStatusInsert as mockInsert,
  paymentIntent,
} from "./test/mocks.js";
import {
  createdEvent,
  failedEvent,
  processingEvent,
  sign,
  succeededEvent,
} from "./test/utils.js";

const post = (payload: string, signature?: string) => {
  const req = supertest(app)
    .post(STRIPE_WEBHOOK_ENDPOINT)
    .set("Content-Type", "application/json");
  if (signature !== undefined) req.set("stripe-signature", signature);
  return req.send(payload);
};

const asPaymentIntent = (value: unknown) =>
  value as unknown as Stripe.Response<Stripe.PaymentIntent>;

describe("receiving a Stripe webhook", () => {
  beforeEach(() => {
    vi.spyOn(stripe.paymentIntents, "retrieve").mockResolvedValue(
      asPaymentIntent(expandedPaymentIntent),
    );
    vi.spyOn(stripe.charges, "update").mockResolvedValue(
      {} as unknown as Stripe.Response<Stripe.Charge>,
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  describe("signature verification", () => {
    it("rejects a tampered payload with a 400", async () => {
      const { payload, signature } = succeededEvent();
      const tampered = payload.replace("pi_test_123", "pi_test_evil");
      await post(tampered, signature).expect(400);
    });

    it("rejects a request signed with the wrong secret with a 400", async () => {
      const payload = JSON.stringify({
        id: "evt",
        type: "payment_intent.succeeded",
      });
      const signature = stripe.webhooks.generateTestHeaderString({
        payload,
        secret: "whsec_the_wrong_secret",
      });

      await post(payload, signature).expect(400);
    });

    it("rejects a request with no stripe-signature header with a 400", async () => {
      const { payload } = succeededEvent();

      await post(payload).expect(400);
    });

    it("returns 500 when STRIPE_WEBHOOK_SECRET is not configured", async () => {
      vi.stubEnv("STRIPE_WEBHOOK_SECRET", undefined);

      await post(
        JSON.stringify({ type: "payment_intent.succeeded" }),
        "t=1,v1=placeholder",
      ).expect(500);
    });
  });

  describe("recording a payment status", () => {
    beforeEach(() => {
      mockPassportLookup();
      mockInsert();
    });

    it("verifies a genuine signature and returns 200 (raw body preserved)", async () => {
      const { payload, signature } = succeededEvent();

      await post(payload, signature).expect(200);
    });

    it("records a 'created' row on a payment_intent.created event", async () => {
      const { payload, signature } = createdEvent();

      await post(payload, signature).expect(200);

      expect(insertCall()?.variables).toEqual(
        expect.objectContaining({
          stripePaymentId: "pi_test_123",
          stripeStatus: "created",
        }),
      );
    });

    it("records a 'processing' row on a payment_intent.processing event (async payment methods)", async () => {
      const { payload, signature } = processingEvent();

      await post(payload, signature).expect(200);

      expect(insertCall()?.variables).toEqual(
        expect.objectContaining({
          stripePaymentId: "pi_test_123",
          stripeStatus: "processing",
        }),
      );
    });

    it("records a 'succeeded' row on a payment_intent.succeeded event", async () => {
      const { payload, signature } = succeededEvent();

      await post(payload, signature).expect(200);

      expect(insertCall()?.variables).toEqual({
        sessionId: paymentIntent.metadata.sessionId,
        flowId: paymentIntent.metadata.flowId,
        teamSlug: "southwark",
        stripePaymentId: "pi_test_123",
        stripeStatus: "succeeded",
        amount: 14500,
        feeBreakdown: null,
        metadata: paymentIntent.metadata,
      });
    });

    it("records a 'payment_failed' status on a payment_intent.payment_failed event", async () => {
      const { payload, signature } = failedEvent();

      await post(payload, signature).expect(200);

      expect(insertCall()?.variables).toEqual(
        expect.objectContaining({
          stripePaymentId: "pi_test_123",
          stripeStatus: "payment_failed",
        }),
      );
    });
  });

  describe("the recorded fee breakdown", () => {
    beforeEach(() => mockInsert());

    it("is derived from the session passport", async () => {
      mockPassportLookup({ "application.fee.payable": 100 });
      const { payload, signature } = succeededEvent();

      await post(payload, signature).expect(200);

      expect(insertCall()?.variables?.feeBreakdown).toMatchObject({
        amount: { payable: 100 },
      });
    });

    it("is null when the passport lookup fails", async () => {
      mockPassportLookupFailure();
      const { payload, signature } = succeededEvent();

      await post(payload, signature).expect(200);

      expect(insertCall()?.variables).toEqual(
        expect.objectContaining({ feeBreakdown: null }),
      );
    });
  });

  describe("Stripe metadata", () => {
    beforeEach(() => {
      mockPassportLookup();
      mockInsert();
    });

    it("stores the PaymentIntent metadata to our database", async () => {
      const metadata = {
        ...paymentIntent.metadata,
        flow: "Apply for planning permission",
        source: "PlanX",
      };
      const { payload, signature } = succeededEvent({ metadata });

      await post(payload, signature).expect(200);

      expect(insertCall()?.variables?.metadata).toEqual(metadata);
    });
  });

  describe("propagating metadata to the destination payment", () => {
    beforeEach(() => {
      mockPassportLookup();
      mockInsert();
    });

    it("copies the PaymentIntent metadata onto the connected account's destination payment", async () => {
      const { payload, signature } = succeededEvent();

      await post(payload, signature).expect(200);

      expect(stripe.charges.update).toHaveBeenCalledWith(
        DESTINATION_PAYMENT_ID,
        { metadata: paymentIntent.metadata },
        { stripeAccount: CONNECTED_ACCOUNT_ID },
      );
    });

    it("does not run for a non-succeeded event", async () => {
      const { payload, signature } = processingEvent();

      await post(payload, signature).expect(200);

      expect(stripe.charges.update).not.toHaveBeenCalled();
    });

    it("returns 200 and skips the update when latest_charge is null", async () => {
      vi.spyOn(stripe.paymentIntents, "retrieve").mockResolvedValue(
        asPaymentIntent({ ...paymentIntent, latest_charge: null }),
      );
      const { payload, signature } = succeededEvent();

      await post(payload, signature).expect(200);

      expect(stripe.charges.update).not.toHaveBeenCalled();
    });

    it("returns 200 and skips the update when the charge has no transfer", async () => {
      vi.spyOn(stripe.paymentIntents, "retrieve").mockResolvedValue(
        asPaymentIntent({
          ...paymentIntent,
          latest_charge: { id: "ch_test_123", transfer: null },
        }),
      );
      const { payload, signature } = succeededEvent();

      await post(payload, signature).expect(200);

      expect(stripe.charges.update).not.toHaveBeenCalled();
    });

    it("returns 200 and skips the update when the transfer is missing its destination fields", async () => {
      vi.spyOn(stripe.paymentIntents, "retrieve").mockResolvedValue(
        asPaymentIntent({
          ...paymentIntent,
          latest_charge: {
            id: "ch_test_123",
            transfer: {
              id: "tr_test_123",
              destination: null,
              destination_payment: null,
            },
          },
        }),
      );
      const { payload, signature } = succeededEvent();

      await post(payload, signature).expect(200);

      expect(stripe.charges.update).not.toHaveBeenCalled();
    });

    it("returns 200 even when the destination-payment update throws", async () => {
      vi.spyOn(stripe.charges, "update").mockRejectedValue(
        new Error("Stripe Connect is unreachable"),
      );
      const { payload, signature } = succeededEvent();

      await post(payload, signature).expect(200);
    });
  });

  describe("when recording is skipped or fails", () => {
    it("returns 500 when the insert fails, so Stripe redelivers the event", async () => {
      mockPassportLookup();
      mockInsert("fail");
      const { payload, signature } = succeededEvent();

      await post(payload, signature).expect(500);
    });

    it("returns 200 without recording when the PaymentIntent metadata is invalid", async () => {
      const { payload, signature } = succeededEvent({
        metadata: { sessionId: "not-a-uuid" },
      });

      await post(payload, signature).expect(200);

      expect(insertCall()).toBeUndefined();
    });

    it("returns 200 without recording for an unhandled event type", async () => {
      const { payload, signature } = sign({
        id: "evt_unhandled",
        type: "charge.refunded",
        data: { object: { id: "ch_test_123" } },
      });

      await post(payload, signature).expect(200);

      expect(insertCall()).toBeUndefined();
    });
  });
});
