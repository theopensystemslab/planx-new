import supertest from "supertest";

import app from "../../../server.js";
import { stripe } from "../client.js";
import { STRIPE_WEBHOOK_ENDPOINT } from "../routes.js";

/** Serialise an event and sign it exactly as Stripe would */
const sign = (event: Record<string, unknown>) => {
  const payload = JSON.stringify(event);
  const signature = stripe.webhooks.generateTestHeaderString({
    payload,
    secret: process.env.STRIPE_WEBHOOK_SECRET!,
  });
  return { payload, signature };
};

const post = (payload: string, signature?: string) => {
  const req = supertest(app)
    .post(STRIPE_WEBHOOK_ENDPOINT)
    .set("Content-Type", "application/json");
  if (signature !== undefined) req.set("stripe-signature", signature);
  return req.send(payload);
};

describe("receiving a Stripe webhook", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("verifies a genuine signature and returns 200 (raw body preserved)", async () => {
    const { payload, signature } = sign({
      id: "evt_test_succeeded",
      type: "payment_intent.succeeded",
      data: { object: { id: "pi_test_123" } },
    });

    await post(payload, signature).expect(200);
  });

  it("returns 200 for an unhandled event type", async () => {
    const { payload, signature } = sign({
      id: "evt_test_unhandled",
      type: "charge.refunded",
      data: { object: { id: "ch_test_123" } },
    });

    await post(payload, signature).expect(200);
  });

  it("rejects a tampered payload with a 400", async () => {
    const { payload, signature } = sign({
      id: "evt_test_tampered",
      type: "payment_intent.succeeded",
      data: { object: { id: "pi_test_123" } },
    });

    // Same (now stale) signature, but a mutated body - verification must fail
    const tampered = payload.replace("pi_test_123", "pi_test_evil");
    await post(tampered, signature).expect(400);
  });

  it("rejects a request signed with the wrong secret with a 400", async () => {
    const payload = JSON.stringify({
      id: "evt_test_wrong_secret",
      type: "payment_intent.succeeded",
      data: { object: {} },
    });
    const signature = stripe.webhooks.generateTestHeaderString({
      payload,
      secret: "whsec_the_wrong_secret",
    });

    await post(payload, signature).expect(400);
  });

  it("rejects a request with no stripe-signature header with a 400", async () => {
    const payload = JSON.stringify({
      id: "evt_test_no_sig",
      type: "payment_intent.succeeded",
      data: { object: {} },
    });

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
