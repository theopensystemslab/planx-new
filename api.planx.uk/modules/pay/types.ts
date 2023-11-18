import { z } from "zod";
import { ValidatedRequestHandler } from "../../shared/middleware/validate";
import { PaymentRequest } from "@opensystemslab/planx-core/types";

export const paymentProxySchema = z.object({
  query: z.object({
    flowId: z.string().uuid(),
    sessionId: z.string().uuid(),
  }),
  params: z.object({
    localAuthority: z.string(),
  }),
});

export type PaymentProxyController = ValidatedRequestHandler<
  typeof paymentProxySchema,
  Buffer
>;

export const inviteToPaySchema = z.object({
  body: z.object({
    payeeEmail: z.string().email(),
    payeeName: z.string(),
    applicantName: z.string(),
    sessionPreviewKeys: z.array(z.array(z.string())),
  }),
  params: z.object({
    sessionId: z.string().uuid(),
  }),
});

export type InviteToPayController = ValidatedRequestHandler<
  typeof inviteToPaySchema,
  PaymentRequest
>;

export const paymentRequestProxySchema = z.object({
  query: z.object({
    flowId: z.string().uuid(),
    sessionId: z.string().uuid(),
  }),
  params: z.object({
    paymentRequest: z.string(),
    localAuthority: z.string(),
  }),
});

export type PaymentRequestProxyController = ValidatedRequestHandler<
  typeof paymentRequestProxySchema,
  Buffer
>;
