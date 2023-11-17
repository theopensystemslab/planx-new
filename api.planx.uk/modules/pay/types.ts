import { z } from "zod";
import { ValidatedRequestHandler } from "../../shared/middleware/validate";

export const paymentProxySchema = z.object({
  query: z.object({
    flowId: z.string().uuid(),
    sessionId: z.string().uuid(),
  }),
  params: z.object({
    localAuthority: z.string(),
  }),
});

export type PaymentProxyController = ValidatedRequestHandler<
  typeof paymentProxySchema,
  Buffer
>;
