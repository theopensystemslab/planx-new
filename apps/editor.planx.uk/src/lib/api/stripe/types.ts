/**
 * - `active` - can take payments
 * - `incomplete` - the council still needs to give Stripe some details
 * - `pending` - details submitted, Stripe is verifying them
 * - `unavailable` - the account was deleted, or its access to PlanX revoked
 */
export type StripeAccountStatus =
  "active" | "incomplete" | "pending" | "unavailable";

export interface StripeConnectStatus {
  connected: boolean;
  accountId: string | null;
  /** null if no account is connected */
  accountStatus: StripeAccountStatus | null;
  mode: "test" | "live";
}

export interface CreateStripeCheckoutSession {
  teamSlug: string;
  sessionId: string;
  flowId: string;
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
  "onboarding_incomplete",
] as const;

export type StripeConnectError =
  (typeof STRIPE_CONNECT_ERRORS)[number] | (string & {});

export type StripeConnectResult =
  { type: "success" } | { type: "error"; message: StripeConnectError };

export type MigrationBlockerReason =
  "stripeNotConnected" | "activeGovpaySessions";

export interface MigrationBlocker {
  reason: MigrationBlockerReason;
  /** conditional because it will only show for activeGovpaySessions */
  count?: number;
}

export interface StripeCanMigrate {
  canMigrate: boolean;
  blockers: MigrationBlocker[];
}
