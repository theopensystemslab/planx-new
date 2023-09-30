import { z } from "zod";
import { ValidatedRequestHandler } from "../../../shared/middleware/validate";

// TODO: Make this better
type Response = [any, any] | any[];

export const CreatePaymentEventSchema = z.object({
  body: z.object({
    createdAt: z.string().transform((val) => new Date(val)),
    payload: z.object({
      paymentRequestId: z.string(),
    }),
  }),
});

export type CreatePaymentEvent = z.infer<
  typeof CreatePaymentEventSchema
>["body"];

export type CreatePaymentEventController = ValidatedRequestHandler<
  typeof CreatePaymentEventSchema,
  Response
>;
