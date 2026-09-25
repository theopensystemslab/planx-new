/**
 * Get the ID from a Stripe reference which may or may not be expanded
 * e.g. `payment_intent` can be either `"pi_…"` or a `Stripe.PaymentIntent`
 */
export const getStripeId = (ref: string | { id: string } | null | undefined) =>
  typeof ref === "string" ? ref : ref?.id;
