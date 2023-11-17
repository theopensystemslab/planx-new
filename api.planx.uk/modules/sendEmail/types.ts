import { z } from "zod";
import { ValidatedRequestHandler } from "../../shared/middleware/validate";

interface SendEmailResponse {
  message: string;
  expiryDate?: string;
}

export const singleApplicationEmailSchema = z.object({
  body: z.object({
    payload: z.object({
      email: z.string().email(),
      sessionId: z.string(),
    }),
  }),
  params: z.object({
    template: z.enum(["reminder", "expiry", "save"]),
  }),
});

export type SingleApplicationEmail = ValidatedRequestHandler<
  typeof singleApplicationEmailSchema,
  SendEmailResponse
>;

export const paymentEmailSchema = z.object({
  body: z.object({
    payload: z.object({
      paymentRequestId: z.string(),
    }),
  }),
  params: z.object({
    template: z.enum([
      "invite-to-pay",
      "invite-to-pay-agent",
      "payment-reminder",
      "payment-reminder-agent",
      "payment-expiry",
      "payment-expiry-agent",
    ]),
  }),
});

export type PaymentEmail = ValidatedRequestHandler<
  typeof paymentEmailSchema,
  SendEmailResponse
>;

export const confirmationEmailSchema = z.object({
  body: z.object({
    payload: z.object({
      sessionId: z.string(),
      lockedAt: z.string().optional(),
      email: z.string().email(),
    }),
  }),
  params: z.object({
    template: z.enum(["confirmation"]),
  }),
});

export type ConfirmationEmail = ValidatedRequestHandler<
  typeof confirmationEmailSchema,
  SendEmailResponse
>;
