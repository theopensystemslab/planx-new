import Stripe from "stripe";

/**
 * Stripe client for e2e tests - test mode keys only
 */
export function getStripeTestClient(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey?.startsWith("sk_test_")) {
    throw Error("STRIPE_SECRET_KEY must be set to a Stripe test mode key");
  }

  return new Stripe(secretKey, { apiVersion: "2026-08-26.dahlia" });
}
