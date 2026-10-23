import { z } from "zod";

import type { ValidatedRequestHandler } from "../../../../shared/middleware/validate.js";

/**
 * Fired by Hasura on every payment_status insert
 */
export const sendVatInvoicesEventSchema = z.object({
  body: z.object({
    payload: z.object({
      stripePaymentId: z.string().nullable(),
      stripeStatus: z.string().nullable(),
    }),
  }),
});

export type SendVatInvoicesEvent = z.infer<
  typeof sendVatInvoicesEventSchema
>["body"];

export interface SendVatInvoicesEventResponse {
  message: string;
}

export type SendVatInvoicesController = ValidatedRequestHandler<
  typeof sendVatInvoicesEventSchema,
  SendVatInvoicesEventResponse
>;
