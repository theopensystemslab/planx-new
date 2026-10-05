import { z } from "zod";

export const stripePaymentMetadataSchema = z.object({
  sessionId: z.string().uuid(),
  origin: z.string(),
});

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
