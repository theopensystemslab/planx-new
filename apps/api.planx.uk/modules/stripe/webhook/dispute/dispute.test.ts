import type Stripe from "stripe";
import supertest from "supertest";

import app from "../../../../server.js";
import * as slackUtils from "../../../slack/utils.js";
import { stripe } from "../../client.js";
import { STRIPE_WEBHOOK_ENDPOINT } from "../../routes.js";
import {
  FLOW_NAME,
  mockSessionLookup,
  paymentIntent,
  TEAM_NAME,
  TEAM_SLUG,
} from "../test/mocks.js";
import { sign } from "../test/utils.js";

const DISPUTE_ID = "dp_test_123";

const dispute = (overrides: Record<string, unknown> = {}) => ({
  id: DISPUTE_ID,
  object: "dispute",
  amount: 14500,
  reason: "fraudulent",
  status: "needs_response",
  charge: "ch_test_123",
  payment_intent: paymentIntent.id,
  payment_method_details: { type: "card" },
  metadata: {},
  ...overrides,
});

const disputeCreatedEvent = (overrides: Record<string, unknown> = {}) =>
  sign({
    id: "evt_dispute_created",
    type: "charge.dispute.created",
    data: { object: dispute(overrides) },
  });

const post = ({ payload, signature }: { payload: string; signature: string }) =>
  supertest(app)
    .post(STRIPE_WEBHOOK_ENDPOINT)
    .set("Content-Type", "application/json")
    .set("stripe-signature", signature)
    .send(payload);

const mockPaymentIntent = (metadata = paymentIntent.metadata) =>
  vi.spyOn(stripe.paymentIntents, "retrieve").mockResolvedValue({
    ...paymentIntent,
    metadata,
  } as unknown as Stripe.Response<Stripe.PaymentIntent>);

const slackText = () =>
  vi
    .mocked(slackUtils.sendSlackMessage)
    .mock.calls.map(([message]) => (message as { text: string }).text);

describe("a disputed payment (charge.dispute.created)", () => {
  beforeEach(() => {
    vi.stubEnv("APP_ENVIRONMENT", "production");
    mockSessionLookup();
    mockPaymentIntent();
    vi.spyOn(slackUtils, "sendSlackMessage").mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it("alerts PlanX on Slack with the application, council, amount, reason and payment method", async () => {
    await post(disputeCreatedEvent()).expect(200);

    expect(stripe.paymentIntents.retrieve).toHaveBeenCalledWith(
      paymentIntent.id,
    );
    expect(slackUtils.sendSlackMessage).toHaveBeenCalledWith(
      expect.objectContaining({ channel: "#planx-notifications-internal" }),
    );
    expect(slackText()).toEqual([
      [
        `:rotating_light: *Stripe dispute opened* [${TEAM_SLUG}]`,
        `Council: ${TEAM_NAME}`,
        `Service: ${FLOW_NAME}`,
        `Session: ${paymentIntent.metadata.sessionId}`,
        "Amount: £145.00",
        "Reason: fraudulent",
        "Payment method: card",
        `Payment: ${paymentIntent.id}`,
        `Dispute: ${DISPUTE_ID}`,
      ].join("\n"),
    ]);
  });

  it("alerts for every payment method, e.g. Bacs Direct Debit", async () => {
    await post(
      disputeCreatedEvent({ payment_method_details: { type: "bacs_debit" } }),
    ).expect(200);

    expect(slackText()[0]).toContain("Payment method: bacs_debit");
  });

  it("shows 'unknown' when the Dispute has no payment method details", async () => {
    await post(
      disputeCreatedEvent({ payment_method_details: undefined }),
    ).expect(200);

    expect(slackText()[0]).toContain("Payment method: unknown");
  });

  it("accepts an expanded PaymentIntent on the Dispute", async () => {
    await post(
      disputeCreatedEvent({ payment_intent: { id: paymentIntent.id } }),
    ).expect(200);

    expect(stripe.paymentIntents.retrieve).toHaveBeenCalledWith(
      paymentIntent.id,
    );
    expect(slackText()).toHaveLength(1);
  });

  it("returns 500, without alerting, when the Dispute has no PaymentIntent", async () => {
    await post(disputeCreatedEvent({ payment_intent: null })).expect(500);

    expect(stripe.paymentIntents.retrieve).not.toHaveBeenCalled();
    expect(slackUtils.sendSlackMessage).not.toHaveBeenCalled();
  });

  it("ignores a dispute for a payment created by another environment", async () => {
    mockPaymentIntent({
      ...paymentIntent.metadata,
      origin: "https://api.another.example.com",
    });

    await post(disputeCreatedEvent()).expect(200);

    expect(slackUtils.sendSlackMessage).not.toHaveBeenCalled();
  });

  it("only logs the alert outside production", async () => {
    vi.stubEnv("APP_ENVIRONMENT", "staging");

    await post(disputeCreatedEvent()).expect(200);

    expect(slackUtils.sendSlackMessage).not.toHaveBeenCalled();
  });

  it("returns 500 when retrieving the PaymentIntent fails, so Stripe redelivers the event", async () => {
    vi.spyOn(stripe.paymentIntents, "retrieve").mockRejectedValue(
      new Error("Stripe is unreachable"),
    );

    await post(disputeCreatedEvent()).expect(500);

    expect(slackUtils.sendSlackMessage).not.toHaveBeenCalled();
  });
});
