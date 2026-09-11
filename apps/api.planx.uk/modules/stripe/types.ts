import { z } from "zod";

import type { ValidatedRequestHandler } from "../../shared/middleware/validate.js";

export const createCheckoutSessionSchema = z.object({
  params: z.object({
    localAuthority: z.string(),
  }),
  body: z.object({
    sessionId: z.string().uuid(),
    flowId: z.string().uuid(),
    amount: z.number().int().positive(),
    returnURL: z.string().url(),
    // TODO: line_item data, metadata?
  }),
});

export interface CreateCheckoutSessionResponse {
  url: string | null;
}

export type CreateCheckoutSessionController = ValidatedRequestHandler<
  typeof createCheckoutSessionSchema,
  CreateCheckoutSessionResponse
>;
