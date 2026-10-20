import type Stripe from "stripe";
import supertest from "supertest";

import app from "../../../../server.js";
import { stripe } from "../../../stripe/client.js";
import {
  FLOW_ID,
  FLOW_NAME,
  mockSessionLookup,
  mockSessionLookupFailure,
  paymentIntent,
  TEAM_NAME,
  TEAM_SLUG,
} from "../../../stripe/webhook/test/mocks.js";
import { sendVatInvoices } from "../../../stripe/webhook/vatInvoice/service.js";

vi.mock(
  "../../../stripe/webhook/vatInvoice/service.js",
  async (importOriginal) => ({
    ...(await importOriginal()),
    sendVatInvoices: vi.fn(),
  }),
);

const { post } = supertest(app);

const ENDPOINT = "/webhooks/hasura/send-vat-invoices";
const AUTH = { Authorization: process.env.HASURA_PLANX_API_KEY! };

const event = (
  payload: Partial<{
    stripePaymentId: string | null;
    stripeStatus: string | null;
  }> = {},
) => ({
  payload: {
    stripePaymentId: paymentIntent.id,
    stripeStatus: "succeeded",
    ...payload,
  },
});

const mockRetrievePaymentIntent = (value: unknown = paymentIntent) =>
  vi
    .spyOn(stripe.paymentIntents, "retrieve")
    .mockResolvedValue(value as Stripe.Response<Stripe.PaymentIntent>);

describe("Send VAT invoices endpoint", () => {
  beforeEach(() => {
    mockRetrievePaymentIntent();
    mockSessionLookup();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.mocked(sendVatInvoices).mockReset();
  });

  describe("authentication and validation", () => {
    it("fails without correct authentication", async () => {
      await post(ENDPOINT).send(event()).expect(401);

      expect(sendVatInvoices).not.toHaveBeenCalled();
    });

    it("returns a 400 if the payload is missing", async () => {
      await post(ENDPOINT).set(AUTH).send({}).expect(400);

      expect(sendVatInvoices).not.toHaveBeenCalled();
    });
  });

  describe("skipping", () => {
    it.each(["initiated", "created", "processing", "payment_failed"])(
      "returns 200 without sending for a '%s' row",
      async (stripeStatus) => {
        await post(ENDPOINT)
          .set(AUTH)
          .send(event({ stripeStatus }))
          .expect(200);

        expect(stripe.paymentIntents.retrieve).not.toHaveBeenCalled();
        expect(sendVatInvoices).not.toHaveBeenCalled();
      },
    );

    it("returns 200 without sending for a GOV.UK Pay row", async () => {
      await post(ENDPOINT)
        .set(AUTH)
        .send(event({ stripePaymentId: null, stripeStatus: null }))
        .expect(200);

      expect(sendVatInvoices).not.toHaveBeenCalled();
    });

    it("returns 200 without sending when the PaymentIntent belongs to another environment", async () => {
      mockRetrievePaymentIntent({
        ...paymentIntent,
        metadata: {
          ...paymentIntent.metadata,
          origin: "https://api.1234.planx.pizza",
        },
      });

      await post(ENDPOINT).set(AUTH).send(event()).expect(200);

      expect(sendVatInvoices).not.toHaveBeenCalled();
    });
  });

  describe("sending", () => {
    it("sends VAT invoices for a succeeded PaymentIntent", async () => {
      await post(ENDPOINT).set(AUTH).send(event()).expect(200);

      expect(stripe.paymentIntents.retrieve).toHaveBeenCalledWith(
        paymentIntent.id,
      );
      expect(sendVatInvoices).toHaveBeenCalledWith(paymentIntent, {
        sessionId: paymentIntent.metadata.sessionId,
        flowId: FLOW_ID,
        flowName: FLOW_NAME,
        teamSlug: TEAM_SLUG,
        teamName: TEAM_NAME,
        passportData: null,
      });
    });
  });

  describe("retries", () => {
    it("returns 500 when the PaymentIntent cannot be retrieved, so Hasura retries the event", async () => {
      vi.spyOn(stripe.paymentIntents, "retrieve").mockRejectedValue(
        new Error("Stripe is down"),
      );

      await post(ENDPOINT).set(AUTH).send(event()).expect(500);

      expect(sendVatInvoices).not.toHaveBeenCalled();
    });

    it("returns 500 when the session lookup fails, so Hasura retries the event", async () => {
      mockSessionLookupFailure();

      await post(ENDPOINT).set(AUTH).send(event()).expect(500);

      expect(sendVatInvoices).not.toHaveBeenCalled();
    });

    it("returns 500 when sending fails, so Hasura retries the event", async () => {
      vi.mocked(sendVatInvoices).mockRejectedValue(
        new Error("PDF render failed"),
      );

      await post(ENDPOINT).set(AUTH).send(event()).expect(500);

      expect(sendVatInvoices).toHaveBeenCalledOnce();
    });
  });
});
