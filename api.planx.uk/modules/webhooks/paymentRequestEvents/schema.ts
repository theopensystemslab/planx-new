import { z } from "zod";
import { ValidatedRequestHandler } from "../../../shared/middleware/validate";

// TODO: Make this better
type Response = [any, any] | any[];

export const createPaymentEventSchema = z.object({
  body: z.object({
    createdAt: z.string().transform((val) => new Date(val)),
    payload: z.object({
      paymentRequestId: z.string(),
    }),
  }),
});

export type CreatePaymentEvent = z.infer<
  typeof createPaymentEventSchema
>["body"];

export type CreatePaymentEventController = ValidatedRequestHandler<
  typeof createPaymentEventSchema,
  Response
>;
