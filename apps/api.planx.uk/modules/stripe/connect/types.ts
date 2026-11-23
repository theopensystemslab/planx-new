import type { Team } from "@opensystemslab/planx-core/types";
import { z } from "zod";

import type { ValidatedRequestHandler } from "../../../shared/middleware/validate.js";

export const connectStatusSchema = z.object({
  params: z.object({
    teamSlug: z.string(),
  }),
});

export const connectSchema = connectStatusSchema.extend({
  query: z.object({
    // omitted if the team just has the regular single account
    account: z.string().trim().min(1).max(100).optional(),
  }),
});

export type TeamLocals = { team: Team };

export const stripeConnectSessionStateSchema = z.object({
  teamId: z.number(),
  teamSlug: z.string(),
  nonce: z.string(),
  accountName: z.string().optional(),
});

export type StripeConnectSessionState = z.infer<
  typeof stripeConnectSessionStateSchema
>;

/**
 * Staging only - an account created for the team which hasn't finished Stripe onboarding yet
 * Only saved to `team_stripe_accounts` once onboarding is complete
 */
export const stripeOnboardingSessionStateSchema = z.object({
  teamId: z.number(),
  accountId: z.string(),
  accountName: z.string().optional(),
});

export type StripeOnboardingSessionState = z.infer<
  typeof stripeOnboardingSessionStateSchema
>;

export type InitiateConnectController = ValidatedRequestHandler<
  typeof connectSchema,
  never,
  TeamLocals
>;

export type OnboardingReturnController = ValidatedRequestHandler<
  typeof connectSchema,
  never,
  TeamLocals
>;

export type ConnectStatusController = ValidatedRequestHandler<
  typeof connectStatusSchema,
  ConnectStatusResponse,
  TeamLocals
>;

/**
 * - `active` - can take payments
 * - `incomplete` - the council still needs to give Stripe some details
 * - `pending` - details submitted, Stripe is verifying them
 * - `unavailable` - the account was deleted, or its access to the platform revoked
 */
export type StripeAccountStatus =
  "active" | "incomplete" | "pending" | "unavailable";

export interface ConnectStatusAccount {
  name: string;
  /** null if the account hasn't been connected in this environment */
  accountId: string | null;
  accountStatus: StripeAccountStatus | null;
  /** only set when using named accounts, null if team invoice details are used */
  invoiceDetailsId: number | null;
}

export interface ConnectStatusResponse {
  /** Whether any of the team's accounts is connected */
  connected: boolean;
  /** The account named after the team - null if it isn't connected (or doesn't exist) */
  accountId: string | null;
  /** null if the account named after the team isn't connected */
  accountStatus: StripeAccountStatus | null;
  mode: "test" | "live";
  govPayConfigured: boolean;
  /** Every account's status, sorted by name - undefined if team just has regular single account */
  accounts?: ConnectStatusAccount[];
}

export const connectCallbackSchema = z.object({
  query: z.object({
    code: z.string().optional(),
    state: z.string().optional(),
    error: z.string().optional(),
  }),
});

export type ConnectCallbackController = ValidatedRequestHandler<
  typeof connectCallbackSchema,
  never
>;
