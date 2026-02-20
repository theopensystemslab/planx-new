import { z } from "zod";
import type { ValidatedRequestHandler } from "../../shared/middleware/validate.js";

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
      lockedAt: z.string().or(z.null()),
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

export const resendEmailSchema = z.object({
  body: z.object({
    payload: z.object({
      userId: z.number(),
      email: z.string().email(),
      firstName: z.string(),
      lastName: z.string(),
    }),
  }),
  params: z.object({
    template: z.enum(["welcome"]),
  }),
});

export type ResendEmail = ValidatedRequestHandler<
  typeof resendEmailSchema,
  SendEmailResponse
>;
