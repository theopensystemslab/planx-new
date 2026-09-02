import { z } from "zod";

import type { ValidatedRequestHandler } from "../../shared/middleware/validate.js";

export const connectSchema = z.object({
  params: z.object({
    teamSlug: z.string(),
  }),
});

export type InitiateConnectController = ValidatedRequestHandler<
  typeof connectSchema,
  never
>;

export type ConnectStatusController = ValidatedRequestHandler<
  typeof connectSchema,
  ConnectStatusResponse
>;

export interface ConnectStatusResponse {
  connected: boolean;
  accountId: string | null;
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
