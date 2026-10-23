import { z } from "zod";

// Only ever redirect applicants to Stripe's hosted Checkout
const STRIPE_CHECKOUT_ORIGIN = "https://checkout.stripe.com" as const;

/**
 * Check that a Checkout Session URL is on hosted Stripe Checkout before redirecting to it
 */
export const getStripeCheckoutURL = (url: string | null): string => {
  if (!url) {
    throw new Error("Stripe Checkout Session did not include a URL");
  }

  if (new URL(url).origin !== STRIPE_CHECKOUT_ORIGIN) {
    throw new Error(
      `Stripe Checkout Session URL is not on ${STRIPE_CHECKOUT_ORIGIN}`,
    );
  }

  return url;
};

const noPaymentMethodErrorSchema = z.object({
  statusCode: z.literal(409),
  data: z.object({
    error: z.string().regex(/cannot take a payment method for a total of/),
  }),
});

/**
 * The API refuses a Checkout Session when the council's Stripe account cannot take any payment method allowed for the total
 * Card is never offered from £600, so this is not a fault - the applicant has to pay the council another way
 */
export const isNoPaymentMethodError = (error: unknown): boolean =>
  noPaymentMethodErrorSchema.safeParse(error).success;
