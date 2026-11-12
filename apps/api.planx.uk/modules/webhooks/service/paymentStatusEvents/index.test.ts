import type Stripe from "stripe";
import supertest from "supertest";

import app from "../../../../server.js";
import { sendSlackMessage } from "../../../slack/utils.js";
import { stripe } from "../../../stripe/client.js";
import { sendPaymentConfirmationEmails } from "../../../stripe/webhook/paymentConfirmation/service.js";
import {
  FLOW_ID,
  FLOW_NAME,
  mockSessionLookup,
  mockSessionLookupFailure,
  paymentIntent,
  TEAM_NAME,
  TEAM_SLUG,
} from "../../../stripe/webhook/test/mocks.js";
import { createInvoices } from "../../../stripe/webhook/vatInvoice/service.js";

vi.mock("../../../slack/utils.js", () => ({
  sendSlackMessage: vi.fn(),
}));

vi.mock("../../../stripe/webhook/paymentConfirmation/service.js", () => ({
  sendPaymentConfirmationEmails: vi.fn(),
}));

vi.mock(
  "../../../stripe/webhook/vatInvoice/service.js",
  async (importOriginal) => ({
    ...(await importOriginal()),
    createInvoices: vi.fn(),
  }),
);

const { post } = supertest(app);

const ENDPOINT = "/webhooks/hasura/payment-status-events";
const AUTH = { Authorization: process.env.HASURA_PLANX_API_KEY! };

const event = (
  payload: Partial<{
    stripePaymentId: string | null;
    stripeStatus: string | null;
    paymentMethod: string | null;
  }> = {},
  currentRetry = 0,
) => ({
  payload: {
    stripePaymentId: paymentIntent.id,
    stripeStatus: "succeeded",
    paymentMethod: "card",
    ...payload,
  },
  deliveryInfo: { currentRetry, maxRetries: 10 },
});

const RECORDED_SESSION = {
  sessionId: paymentIntent.metadata.sessionId,
  flowId: FLOW_ID,
  flowName: FLOW_NAME,
  teamSlug: TEAM_SLUG,
  teamName: TEAM_NAME,
  passportData: null,
};

const mockRetrievePaymentIntent = (value: unknown = paymentIntent) =>
  vi
    .spyOn(stripe.paymentIntents, "retrieve")
    .mockResolvedValue(value as Stripe.Response<Stripe.PaymentIntent>);

describe("Payment status events endpoint", () => {
  beforeEach(() => {
    mockRetrievePaymentIntent();
    mockSessionLookup();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.mocked(createInvoices).mockReset();
    vi.mocked(sendPaymentConfirmationEmails).mockReset();
    vi.mocked(sendSlackMessage).mockReset();
  });

  describe("authentication and validation", () => {
    it("fails without correct authentication", async () => {
      await post(ENDPOINT).send(event()).expect(401);

      expect(createInvoices).not.toHaveBeenCalled();
    });

    it("returns a 400 if the payload is missing", async () => {
      await post(ENDPOINT).set(AUTH).send({}).expect(400);

      expect(createInvoices).not.toHaveBeenCalled();
    });

    it("returns a 400 if the delivery info is missing", async () => {
      const { payload } = event();

      await post(ENDPOINT).set(AUTH).send({ payload }).expect(400);

      expect(createInvoices).not.toHaveBeenCalled();
    });
  });

  describe("skipping", () => {
    it.each(["initiated", "created", "processing", "payment_failed"])(
      "returns 200 without creating documents for a '%s' row",
      async (stripeStatus) => {
        await post(ENDPOINT)
          .set(AUTH)
          .send(event({ stripeStatus }))
          .expect(200);

        expect(stripe.paymentIntents.retrieve).not.toHaveBeenCalled();
        expect(createInvoices).not.toHaveBeenCalled();
      },
    );

    it("returns 200 without creating documents for a GOV.UK Pay row", async () => {
      await post(ENDPOINT)
        .set(AUTH)
        .send(event({ stripePaymentId: null, stripeStatus: null }))
        .expect(200);

      expect(createInvoices).not.toHaveBeenCalled();
    });

    it("returns 200 without creating documents when the PaymentIntent belongs to another environment", async () => {
      mockRetrievePaymentIntent({
        ...paymentIntent,
        metadata: {
          ...paymentIntent.metadata,
          origin: "https://api.1234.planx.pizza",
        },
      });

      await post(ENDPOINT).set(AUTH).send(event()).expect(200);

      expect(createInvoices).not.toHaveBeenCalled();
    });
  });

  describe("succeeded payments", () => {
    it("creates the VAT documents, then sends the payment emails", async () => {
      await post(ENDPOINT).set(AUTH).send(event()).expect(200);

      expect(stripe.paymentIntents.retrieve).toHaveBeenCalledWith(
        paymentIntent.id,
      );
      expect(createInvoices).toHaveBeenCalledWith(
        paymentIntent,
        RECORDED_SESSION,
      );
      expect(sendPaymentConfirmationEmails).toHaveBeenCalledWith(
        paymentIntent,
        RECORDED_SESSION,
        "card",
      );
      expect(
        vi.mocked(createInvoices).mock.invocationCallOrder[0],
      ).toBeLessThan(
        vi.mocked(sendPaymentConfirmationEmails).mock.invocationCallOrder[0],
      );
    });

    it("does not send the payment emails when creating the documents fails", async () => {
      vi.mocked(createInvoices).mockRejectedValue(
        new Error("PDF render failed"),
      );

      await post(ENDPOINT).set(AUTH).send(event()).expect(500);

      expect(sendPaymentConfirmationEmails).not.toHaveBeenCalled();
    });
  });

  describe("retries", () => {
    it("returns 500 when the PaymentIntent cannot be retrieved, so Hasura retries the event", async () => {
      vi.spyOn(stripe.paymentIntents, "retrieve").mockRejectedValue(
        new Error("Stripe is down"),
      );

      await post(ENDPOINT).set(AUTH).send(event()).expect(500);

      expect(createInvoices).not.toHaveBeenCalled();
    });

    it("returns 500 when the session lookup fails, so Hasura retries the event", async () => {
      mockSessionLookupFailure();

      await post(ENDPOINT).set(AUTH).send(event()).expect(500);

      expect(createInvoices).not.toHaveBeenCalled();
    });

    it("returns 500 when sending the emails fails, so Hasura retries the event", async () => {
      vi.mocked(sendPaymentConfirmationEmails).mockRejectedValue(
        new Error("Resend is down"),
      );

      await post(ENDPOINT).set(AUTH).send(event({}, 9)).expect(500);

      expect(sendSlackMessage).not.toHaveBeenCalled();
    });

    it("returns 200 and alerts PlanX when the final attempt fails, so Hasura stops retrying", async () => {
      vi.stubEnv("APP_ENVIRONMENT", "production");
      vi.mocked(sendPaymentConfirmationEmails).mockRejectedValue(
        new Error("Resend is down"),
      );

      await post(ENDPOINT).set(AUTH).send(event({}, 10)).expect(200);

      expect(sendSlackMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          channel: "#planx-notifications-internal",
          text: expect.stringContaining(paymentIntent.id),
        }),
      );
      vi.unstubAllEnvs();
    });

    it("does not post to Slack outside production on the final attempt", async () => {
      vi.mocked(createInvoices).mockRejectedValue(
        new Error("PDF render failed"),
      );
      const consoleLog = vi
        .spyOn(console, "log")
        .mockImplementation(() => undefined);

      await post(ENDPOINT).set(AUTH).send(event({}, 10)).expect(200);

      expect(sendSlackMessage).not.toHaveBeenCalled();
      consoleLog.mockRestore();
    });
  });
});
