import { z } from "zod";
import { ValidatedRequestHandler } from "../../../shared/middleware/validate";

// TODO: Make this better
type Response = [any, any];

export const CreatePaymentInvitationEventsSchema = z.object({
  body: z.object({
    createdAt: z.string().transform((val) => new Date(val)),
    payload: z.object({
      paymentRequestId: z.string(),
    }),
  }),
});

export type CreatePaymentInvitation = z.infer<
  typeof CreatePaymentInvitationEventsSchema
>["body"];

export type CreatePaymentInvitationEvents = ValidatedRequestHandler<
  typeof CreatePaymentInvitationEventsSchema,
  Response
>;
