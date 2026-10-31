import type Stripe from "stripe";
import supertest from "supertest";

import { sendEmail } from "../../../../lib/resend/index.js";
import app from "../../../../server.js";
import { queryMock } from "../../../../tests/graphqlQueryMock.js";
import * as payHelpers from "../../../pay/helpers.js";
import * as slackUtils from "../../../slack/utils.js";
import { stripe } from "../../client.js";
import { STRIPE_WEBHOOK_ENDPOINT } from "../../routes.js";
import {
  FLOW_NAME,
  mockSessionLookup,
  paymentIntent,
  TEAM_NAME,
} from "../test/mocks.js";
import { sign } from "../test/utils.js";

vi.mock("../../../../lib/resend/index.js", () => ({
  sendEmail: vi.fn(),
}));

const SESSION_ID = paymentIntent.metadata.sessionId;
const PAYMENT_INTENT_ID = "pi_test_bacs";
const PAYER_EMAIL = "payer@example.com";
const COUNCIL_EMAIL = "finance@southwark.gov.uk";
const ADDRESS = "1 High Street, London";
// 2026-10-28T12:00:00Z
const EVENT_CREATED = 1793188800;

const SUCCEEDED = "checkout.session.async_payment_succeeded";
const FAILED = "checkout.session.async_payment_failed";

const checkoutSession = (overrides: Record<string, unknown> = {}) => ({
  id: "cs_test_bacs",
  object: "checkout.session",
  status: "complete",
  payment_status: "unpaid",
  payment_intent: PAYMENT_INTENT_ID,
  amount_total: 14500,
  customer_details: { email: PAYER_EMAIL },
  metadata: paymentIntent.metadata,
  ...overrides,
});

const inviteToPayMetadata = {
  ...paymentIntent.metadata,
  paymentRequestId: "09655c28-3f34-4619-9385-cd57312acc44",
};

const asyncPaymentEvent = (
  type: typeof SUCCEEDED | typeof FAILED,
  objectOverrides: Record<string, unknown> = {},
) =>
  sign({
    id: `evt_${type}`,
    type,
    created: EVENT_CREATED,
    data: { object: checkoutSession(objectOverrides) },
  });

const post = ({ payload, signature }: { payload: string; signature: string }) =>
  supertest(app)
    .post(STRIPE_WEBHOOK_ENDPOINT)
    .set("Content-Type", "application/json")
    .set("stripe-signature", signature)
    .send(payload);

const mockPaymentOutcomeDetails = ({
  submittedAt = "2026-10-21T12:00:00Z" as string | null,
  paymentMethod = "bacs_debit" as string | null,
  invoiceDetails = { emailAddress: COUNCIL_EMAIL } as {
    emailAddress: string | null;
  } | null,
} = {}) =>
  queryMock.mockQuery({
    name: "GetPaymentOutcomeDetails",
    matchOnVariables: false,
    data: {
      session: {
        submittedAt,
        flow: { team: { invoiceDetails } },
      },
      paymentStatus: paymentMethod ? [{ paymentMethod }] : [],
    },
  });

const mockPaymentIntent = (overrides: Record<string, unknown> = {}) =>
  vi.spyOn(stripe.paymentIntents, "retrieve").mockResolvedValue({
    id: PAYMENT_INTENT_ID,
    latest_charge: {
      id: "ch_test_bacs",
      failure_code: "debit_not_authorized",
      failure_message: "The customer's bank account could not be debited.",
    },
    last_payment_error: null,
    ...overrides,
  } as unknown as Stripe.Response<Stripe.PaymentIntent>);

const sentEmails = () =>
  vi.mocked(sendEmail).mock.calls.map(([template, to, variables, options]) => ({
    template,
    to,
    variables,
    options,
  }));

const sentTo = (template: string) =>
  sentEmails()
    .filter((email) => email.template === template)
    .map(({ to }) => to);

const expectedVariables = {
  serviceName: FLOW_NAME,
  councilName: TEAM_NAME,
  sessionId: SESSION_ID,
  address: ADDRESS,
  paymentReference: PAYMENT_INTENT_ID,
  paymentMethod: "Bacs Direct Debit",
  amount: "£145.00",
};

describe("the result of a delayed payment (e.g. Bacs Direct Debit)", () => {
  beforeEach(() => {
    mockSessionLookup({ passportData: { _address: { title: ADDRESS } } });
    mockPaymentOutcomeDetails();
    mockPaymentIntent();
    vi.spyOn(payHelpers, "reportError");
    vi.spyOn(slackUtils, "sendSlackMessage").mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.mocked(sendEmail).mockReset();
    vi.unstubAllEnvs();
  });

  describe("checkout.session.async_payment_succeeded", () => {
    it("emails the council that the payment is confirmed", async () => {
      await post(asyncPaymentEvent(SUCCEEDED)).expect(200);

      expect(sentEmails()).toEqual([
        {
          template: "payment-confirmed-council",
          to: COUNCIL_EMAIL,
          variables: { ...expectedVariables, paymentDate: "28 October 2026" },
          options: {
            idempotencyKey: `payment-confirmed-council-evt_${SUCCEEDED}`,
          },
        },
      ]);
    });

    it("emails only the council for invite to pay - not the payer or applicant", async () => {
      await post(
        asyncPaymentEvent(SUCCEEDED, { metadata: inviteToPayMetadata }),
      ).expect(200);

      expect(sentEmails().map(({ template }) => template)).toEqual([
        "payment-confirmed-council",
      ]);
    });

    it.each([
      { case: "no invoice details", invoiceDetails: null },
      { case: "no invoice email", invoiceDetails: { emailAddress: null } },
    ])(
      "alerts PlanX on Slack, and emails no one, when the council has $case",
      async ({ invoiceDetails }) => {
        vi.stubEnv("APP_ENVIRONMENT", "production");
        mockPaymentOutcomeDetails({ invoiceDetails });

        await post(asyncPaymentEvent(SUCCEEDED)).expect(200);

        expect(sendEmail).not.toHaveBeenCalled();
        expect(slackUtils.sendSlackMessage).toHaveBeenCalledWith(
          expect.objectContaining({
            text: expect.stringContaining("the council has no invoice email"),
          }),
        );
      },
    );

    it("alerts PlanX on Slack, and emails no one, when the application was never submitted", async () => {
      vi.stubEnv("APP_ENVIRONMENT", "production");
      mockPaymentOutcomeDetails({ submittedAt: null });

      await post(asyncPaymentEvent(SUCCEEDED)).expect(200);

      expect(sendEmail).not.toHaveBeenCalled();
      expect(slackUtils.sendSlackMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          text: expect.stringContaining(
            `session ${SESSION_ID} has not been submitted`,
          ),
        }),
      );
    });

    it("only logs the Slack alert outside production", async () => {
      mockPaymentOutcomeDetails({ submittedAt: null });

      await post(asyncPaymentEvent(SUCCEEDED)).expect(200);

      expect(slackUtils.sendSlackMessage).not.toHaveBeenCalled();
    });

    it("reads the payment method from the recorded payment status", async () => {
      await post(asyncPaymentEvent(SUCCEEDED)).expect(200);

      const lookup = queryMock
        .getCalls()
        .find(({ id }) => id === "GetPaymentOutcomeDetails");
      expect(lookup?.variables).toEqual({
        sessionId: SESSION_ID,
        paymentIntentId: PAYMENT_INTENT_ID,
      });
    });

    it.each([
      { paymentMethod: null, expected: "Not known" },
      { paymentMethod: "link", expected: "link" },
    ])(
      "shows the payment method as '$expected' when the recorded method is $paymentMethod",
      async ({ paymentMethod, expected }) => {
        mockPaymentOutcomeDetails({ paymentMethod });

        await post(asyncPaymentEvent(SUCCEEDED)).expect(200);

        expect(sentEmails()[0].variables).toEqual(
          expect.objectContaining({ paymentMethod: expected }),
        );
      },
    );

    it("includes the payment method in the Slack alert", async () => {
      vi.stubEnv("APP_ENVIRONMENT", "production");
      mockPaymentOutcomeDetails({ submittedAt: null });

      await post(asyncPaymentEvent(SUCCEEDED)).expect(200);

      expect(slackUtils.sendSlackMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          text: expect.stringContaining(
            `*${PAYMENT_INTENT_ID}* (Bacs Direct Debit) succeeded`,
          ),
        }),
      );
    });

    it("uses placeholders when the session has no address, or the Checkout Session has no amount", async () => {
      mockSessionLookup({ passportData: null });

      await post(asyncPaymentEvent(SUCCEEDED, { amount_total: null })).expect(
        200,
      );

      expect(sentEmails()[0].variables).toEqual(
        expect.objectContaining({
          address: "Not provided",
          amount: "Not provided",
        }),
      );
    });

    it("accepts an expanded PaymentIntent on the Checkout Session", async () => {
      await post(
        asyncPaymentEvent(SUCCEEDED, {
          payment_intent: { id: PAYMENT_INTENT_ID },
        }),
      ).expect(200);

      expect(sentEmails()[0].variables).toEqual(
        expect.objectContaining({ paymentReference: PAYMENT_INTENT_ID }),
      );
    });
  });

  describe("checkout.session.async_payment_failed", () => {
    it("emails the payer and the council (self-pay), with the reason for the council", async () => {
      await post(asyncPaymentEvent(FAILED)).expect(200);

      expect(sentEmails()).toEqual([
        {
          template: "payment-failed-payer",
          to: PAYER_EMAIL,
          variables: expectedVariables,
          options: { idempotencyKey: `payment-failed-payer-evt_${FAILED}` },
        },
        {
          template: "payment-failed-council",
          to: COUNCIL_EMAIL,
          variables: {
            ...expectedVariables,
            failureCode: "debit_not_authorized",
            failureMessage: "The customer's bank account could not be debited.",
          },
          options: { idempotencyKey: `payment-failed-council-evt_${FAILED}` },
        },
      ]);
      expect(stripe.paymentIntents.retrieve).toHaveBeenCalledWith(
        PAYMENT_INTENT_ID,
        { expand: ["latest_charge"] },
      );
    });

    it("emails only the nominee (the payer) and the council for invite to pay - not the applicant", async () => {
      await post(
        asyncPaymentEvent(FAILED, { metadata: inviteToPayMetadata }),
      ).expect(200);

      expect(sentEmails().map(({ template, to }) => [template, to])).toEqual([
        ["payment-failed-payer", PAYER_EMAIL],
        ["payment-failed-council", COUNCIL_EMAIL],
      ]);
    });

    it("reports, and emails no one, when the Checkout Session has no payer email", async () => {
      await post(asyncPaymentEvent(FAILED, { customer_details: null })).expect(
        200,
      );

      expect(sendEmail).not.toHaveBeenCalled();
      expect(payHelpers.reportError).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining("Could not email the payer"),
        }),
      );
    });

    it("emails the payer, alerts PlanX on Slack, and does not email the council, when the application was never submitted", async () => {
      vi.stubEnv("APP_ENVIRONMENT", "production");
      mockPaymentOutcomeDetails({ submittedAt: null });

      await post(asyncPaymentEvent(FAILED)).expect(200);

      expect(sentEmails().map(({ template }) => template)).toEqual([
        "payment-failed-payer",
      ]);
      expect(slackUtils.sendSlackMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          text: expect.stringContaining(
            `session ${SESSION_ID} has not been submitted`,
          ),
        }),
      );
    });

    it("alerts PlanX on Slack when there is no council address", async () => {
      vi.stubEnv("APP_ENVIRONMENT", "production");
      mockPaymentOutcomeDetails({ invoiceDetails: null });

      await post(asyncPaymentEvent(FAILED)).expect(200);

      expect(sentTo("payment-failed-council")).toEqual([]);
      expect(slackUtils.sendSlackMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          text: expect.stringContaining("Tell the council to chase the fee"),
        }),
      );
    });

    it("reads the reason from the last payment error when the Charge has none", async () => {
      mockPaymentIntent({
        latest_charge: "ch_test_unexpanded",
        last_payment_error: {
          code: "payment_method_not_available",
          message: "The mandate was refused.",
        },
      });

      await post(asyncPaymentEvent(FAILED)).expect(200);

      expect(sentEmails()[1].variables).toEqual(
        expect.objectContaining({
          failureCode: "payment_method_not_available",
          failureMessage: "The mandate was refused.",
        }),
      );
    });

    it("sends 'unknown' when Stripe gives no reason", async () => {
      mockPaymentIntent({ latest_charge: null, last_payment_error: null });

      await post(asyncPaymentEvent(FAILED)).expect(200);

      expect(sentEmails()[1].variables).toEqual(
        expect.objectContaining({ failureCode: "unknown", failureMessage: "" }),
      );
    });
  });

  describe("for both outcomes", () => {
    it.each([SUCCEEDED, FAILED] as const)(
      "%s: ignores a payment created by another environment",
      async (type) => {
        await post(
          asyncPaymentEvent(type, {
            metadata: {
              ...paymentIntent.metadata,
              origin: "https://api.another.example.com",
            },
          }),
        ).expect(200);

        expect(sendEmail).not.toHaveBeenCalled();
      },
    );

    it.each([SUCCEEDED, FAILED] as const)(
      "%s: returns 500 when the Checkout Session has no PaymentIntent",
      async (type) => {
        await post(asyncPaymentEvent(type, { payment_intent: null })).expect(
          500,
        );

        expect(sendEmail).not.toHaveBeenCalled();
      },
    );

    it.each([SUCCEEDED, FAILED] as const)(
      "%s: returns 500 when an email fails, so Stripe redelivers the event (idempotency keys stop duplicates)",
      async (type) => {
        vi.mocked(sendEmail).mockRejectedValue(new Error("Resend is down"));

        await post(asyncPaymentEvent(type)).expect(500);
      },
    );

    it("never submits the application", async () => {
      await post(asyncPaymentEvent(SUCCEEDED)).expect(200);
      await post(asyncPaymentEvent(FAILED)).expect(200);

      const operations = new Set(queryMock.getCalls().map(({ id }) => id));
      expect([...operations].sort()).toEqual([
        "GetPaymentOutcomeDetails",
        "GetStripePaymentSession",
      ]);
    });
  });
});
