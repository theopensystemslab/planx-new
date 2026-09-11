import assert from "assert";
import Stripe from "stripe";

assert(process.env.STRIPE_SECRET_KEY);
assert(process.env.STRIPE_WEBHOOK_SECRET);

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2026-08-26.dahlia",
});
