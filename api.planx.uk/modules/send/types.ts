import { z } from "zod";
import type { ValidatedRequestHandler } from "../../shared/middleware/validate.js";

export const sendIntegrationSchema = z.object({
  body: z.object({
    payload: z.object({
      sessionId: z.string().uuid(),
    }),
  }),
  params: z.object({
    localAuthority: z.string(),
  }),
});

export type SendIntegrationController = ValidatedRequestHandler<
  typeof sendIntegrationSchema,
  unknown
>;
