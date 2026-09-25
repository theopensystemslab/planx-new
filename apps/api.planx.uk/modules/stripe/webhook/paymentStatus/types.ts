import { z } from "zod";

export const stripePaymentMetadataSchema = z.object({
  sessionId: z.string().uuid(),
  flowId: z.string().uuid(),
  teamSlug: z.string().min(1),
  origin: z.string(),
});

export type StripePaymentMetadata = z.infer<typeof stripePaymentMetadataSchema>;

export const hasuraClientErrorSchema = z.object({
  response: z.object({
    errors: z.array(
      z.object({
        message: z.string(),
        extensions: z.object({ code: z.string() }),
      }),
    ),
  }),
});
