export interface StripeConnectStatus {
  connected: boolean;
  accountId: string | null;
  mode: "test" | "live";
}

export interface CreateStripeCheckoutSession {
  teamSlug: string;
  sessionId: string;
  flowId: string;
  /** Fee in pence */
  amount: number;
  returnURL: string;
  metadata: Record<string, string>;
}

export interface StripeCheckoutSession {
  url: string | null;
}

export interface StripeCheckoutSessionStatus {
  status: "complete" | "expired" | "open" | null;
  paymentStatus: "paid" | "unpaid" | "no_payment_required";
  paymentIntentId: string | null;
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

export type StripeConnectResult =
  { type: "success" } | { type: "error"; message: StripeConnectError };
