import { z } from "zod";

import type { ValidatedRequestHandler } from "../../../../shared/middleware/validate.js";

/**
 * Fired by Hasura on every payment_status insert
 */
export const paymentStatusEventSchema = z.object({
  body: z.object({
    payload: z.object({
      stripePaymentId: z.string().nullable(),
      stripeStatus: z.string().nullable(),
    }),
    // Hasura's delivery attempt - current_retry starts at 0
    deliveryInfo: z.object({
      currentRetry: z.number(),
      maxRetries: z.number(),
    }),
  }),
});

export type PaymentStatusEvent = z.infer<
  typeof paymentStatusEventSchema
>["body"];

export interface PaymentStatusEventResponse {
  message: string;
}

export type PaymentStatusEventsController = ValidatedRequestHandler<
  typeof paymentStatusEventSchema,
  PaymentStatusEventResponse
>;
