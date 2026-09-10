import type { Team } from "@opensystemslab/planx-core/types";
import { z } from "zod";

import type { ValidatedRequestHandler } from "../../shared/middleware/validate.js";

export const connectSchema = z.object({
  params: z.object({
    teamSlug: z.string(),
  }),
});

export type TeamLocals = { team: Team };

export const stripeConnectSessionStateSchema = z.object({
  teamId: z.number(),
  teamSlug: z.string(),
  nonce: z.string(),
});

export type StripeConnectSessionState = z.infer<
  typeof stripeConnectSessionStateSchema
>;

export type InitiateConnectController = ValidatedRequestHandler<
  typeof connectSchema,
  never,
  TeamLocals
>;

export type ConnectStatusController = ValidatedRequestHandler<
  typeof connectSchema,
  ConnectStatusResponse,
  TeamLocals
>;

export interface ConnectStatusResponse {
  connected: boolean;
  accountId: string | null;
  mode: "test" | "live";
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
