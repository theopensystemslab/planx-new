import { stripe } from "../../client.js";
import { paymentIntent, transfer } from "./mocks.js";

/** Serialise an event and sign it exactly as Stripe would */
export const sign = (event: Record<string, unknown>) => {
  const payload = JSON.stringify(event);
  const signature = stripe.webhooks.generateTestHeaderString({
    payload,
    secret: process.env.STRIPE_WEBHOOK_SECRET!,
  });
  return { payload, signature };
};

export const succeededEvent = (objectOverrides: Record<string, unknown> = {}) =>
  sign({
    id: "evt_succeeded",
    type: "payment_intent.succeeded",
    data: {
      object: { ...paymentIntent, status: "succeeded", ...objectOverrides },
    },
  });

export const failedEvent = () =>
  sign({
    id: "evt_failed",
    type: "payment_intent.payment_failed",
    data: { object: { ...paymentIntent, status: "requires_payment_method" } },
  });

export const createdEvent = () =>
  sign({
    id: "evt_created",
    type: "payment_intent.created",
    // At creation the PI sits at `requires_payment_method`; we record "created" from the event.
    data: { object: { ...paymentIntent, status: "requires_payment_method" } },
  });

export const processingEvent = () =>
  sign({
    id: "evt_processing",
    type: "payment_intent.processing",
    // Fired for async methods (Bacs, bank transfer)
    data: { object: { ...paymentIntent, status: "processing" } },
  });

export const transferCreatedEvent = (
  objectOverrides: Record<string, unknown> = {},
) =>
  sign({
    id: "evt_transfer_created",
    type: "transfer.created",
    data: { object: { ...transfer, ...objectOverrides } },
  });
