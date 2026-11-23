/**
 * - `active` - can take payments
 * - `incomplete` - the council still needs to give Stripe some details
 * - `pending` - details submitted, Stripe is verifying them
 * - `unavailable` - the account was deleted, or its access to PlanX revoked
 */
export type StripeAccountStatus =
  "active" | "incomplete" | "pending" | "unavailable";

/**
 * One of the accounts of a team with multiple Stripe accounts enabled
 * This can include an account named after the team (e.g. one connected before multiple accounts were enabled)
 */
export interface StripeConnectAccount {
  name: string;
  /** null if the account hasn't been connected in this environment */
  accountId: string | null;
  accountStatus: StripeAccountStatus | null;
  /** invoice details for the named account - null if using team-level invoice details  */
  invoiceDetailsId: number | null;
}

export interface StripeConnectStatus {
  /** Whether the team has a connected account - for a team with multiple accounts, whether any of them is connected */
  connected: boolean;
  /** The account named after the team (a team's only account, unless it has multiple accounts) */
  accountId: string | null;
  /** null if no account is connected */
  accountStatus: StripeAccountStatus | null;
  mode: "test" | "live";
  govPayConfigured: boolean;
  /** Every named account - only used for a team with multiple Stripe accounts enabled */
  accounts?: StripeConnectAccount[];
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

export interface FulfilPaymentRequest {
  paymentRequestId: string;
  checkoutSessionId: string;
}

export interface FulfilPaymentRequestResult {
  paymentStatus: "paid" | "pending";
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
  "stripePaymentsNotEnabled" | "stripeNotConnected" | "activeGovpaySessions";

export interface MigrationBlocker {
  reason: MigrationBlockerReason;
  /** conditional because it will only show for activeGovpaySessions */
  count?: number;
}

export interface StripeCanMigrate {
  canMigrate: boolean;
  blockers: MigrationBlocker[];
}

export interface StripeRevertResult {
  paymentProvider: "govpay";
}
