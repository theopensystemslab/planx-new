/**
 * Get the ID from a Stripe reference which may or may not be expanded
 * e.g. `payment_intent` can be either `"pi_…"` or a `Stripe.PaymentIntent`
 */
export const getStripeId = (ref: string | { id: string } | null | undefined) =>
  typeof ref === "string" ? ref : ref?.id;

export const formatPence = (pence: number) =>
  (pence / 100).toLocaleString("en-GB", { style: "currency", currency: "GBP" });

/**
 * Go-live switch
 *
 * Stripe payments are off in production, so teams can connect a Stripe account ahead of time but can't migrate from GOV.UK Pay or take payments
 */
export const isStripePaymentsEnabled = (): boolean =>
  process.env.APP_ENVIRONMENT !== "production";
