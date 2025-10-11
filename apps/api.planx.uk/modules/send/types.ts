import { z } from "zod";
import type { ValidatedRequestHandler } from "../../shared/middleware/validate.js";

const payloadSchema = z.object({
  sessionId: z.string().uuid(),
});

export type SendIntegrationPayload = z.infer<typeof payloadSchema>;

export const sendIntegrationSchema = z.object({
  body: z.object({
    payload: payloadSchema,
  }),
  params: z.object({
    localAuthority: z.string(),
  }),
});

export type SendIntegrationController = ValidatedRequestHandler<
  typeof sendIntegrationSchema,
  unknown
>;
