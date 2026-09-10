export interface StripeConnectStatus {
  connected: boolean;
  accountId: string | null;
  mode: "test" | "live";
}

/**
 * Values that the API Stripe Connect callback can redirect back with via the `stripeError` search param
 * `string & {}` keeps these as autocomplete hints without excluding other error codes Stripe may send
 */
export const STRIPE_CONNECT_ERRORS = [
  "invalid_state",
  "access_denied",
  "missing_code",
  "connect_failed",
] as const;

export type StripeConnectError =
  (typeof STRIPE_CONNECT_ERRORS)[number] | (string & {});
