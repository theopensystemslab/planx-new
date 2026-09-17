import { z } from "zod";

export const stripePaymentMetadataSchema = z.object({
  sessionId: z.string().uuid(),
  flowId: z.string().uuid(),
  teamSlug: z.string().min(1),
});

export type StripePaymentMetadata = z.infer<typeof stripePaymentMetadataSchema>;
