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
