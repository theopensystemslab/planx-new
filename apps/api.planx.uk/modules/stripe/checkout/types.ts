import type Stripe from "stripe";
import { z } from "zod";

import type { ValidatedRequestHandler } from "../../../shared/middleware/validate.js";

export const createCheckoutSessionSchema = z.object({
  params: z.object({
    localAuthority: z.string(),
  }),
  body: z.object({
    sessionId: z.string().uuid(),
    flowId: z.string().uuid(),
    amount: z.number().int().positive(),
    returnURL: z.string().url(),
    metadata: z
      .object({
        flow: z.string(),
        source: z.string(),
        paidViaInviteToPay: z.string(),
      })
      // All additional metadata must have string() values
      .catchall(z.string()),
  }),
});

export interface CreateCheckoutSessionInput {
  sessionId: string;
  flowId: string;
  amount: number;
  returnURL: string;
  teamSlug: string;
  connectedAccountId: string;
  metadata: Record<string, string>;
}

export interface CreateCheckoutSessionResponse {
  url: string | null;
}

export type CheckoutSessionLocals = {
  connectedAccountId: string;
};

export type ResolveTeamPaymentProviderMiddleware = ValidatedRequestHandler<
  typeof createCheckoutSessionSchema,
  CreateCheckoutSessionResponse,
  CheckoutSessionLocals
>;

export type CreateCheckoutSessionController = ValidatedRequestHandler<
  typeof createCheckoutSessionSchema,
  CreateCheckoutSessionResponse,
  CheckoutSessionLocals
>;

export const getCheckoutSessionStatusSchema = z.object({
  params: z.object({
    localAuthority: z.string(),
    checkoutSessionId: z.string(),
  }),
});

export interface CheckoutSessionStatusResponse {
  status: Stripe.Checkout.Session.Status | null;
  paymentStatus: Stripe.Checkout.Session.PaymentStatus;
  paymentIntentId: string | null;
}

export type GetCheckoutSessionStatusController = ValidatedRequestHandler<
  typeof getCheckoutSessionStatusSchema,
  CheckoutSessionStatusResponse
>;
