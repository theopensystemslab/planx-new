import type {
  FeeBreakdown,
  Passport,
  PaymentMetadata,
  PaymentRequest,
} from "@opensystemslab/planx-core/types";
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
    metadata: z
      .object({
        flow: z.string(),
        source: z.literal("PlanX"),
        paidViaInviteToPay: z.string(),
      })
      // All additional metadata must have string() values
      .catchall(z.string()),
  }),
});

export interface CreateCheckoutSessionInput {
  sessionId: string;
  flowId: string;
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
  returnURL: string;
};

export type ResolveTeamPaymentProviderMiddleware = ValidatedRequestHandler<
  typeof createCheckoutSessionSchema,
  CreateCheckoutSessionResponse,
  CheckoutSessionLocals
>;

export type ResolveReturnURLMiddleware = ValidatedRequestHandler<
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

export const createPaymentRequestCheckoutSessionSchema = z.object({
  params: z.object({
    paymentRequestId: z.string().uuid(),
  }),
});

export type PaymentRequestRecord = Pick<
  PaymentRequest,
  "id" | "sessionId" | "payeeEmail" | "createdAt" | "stripeMetadata"
> & {
  feeBreakdown: FeeBreakdown | null;
  paidAt: string | null;
  govPayPaymentId: string | null;
  session: {
    flowId: string;
    deletedAt: string | null;
    lockedAt: string | null;
    passport: Passport;
    flow: {
      slug: string;
      team: { slug: string; domain: string | null };
    };
  } | null;
};

/**
 * An unpaid, unexpired ITP request, for a locked session
 */
export type PayablePaymentRequest = Omit<
  PaymentRequestRecord,
  "createdAt" | "paidAt" | "govPayPaymentId" | "stripeMetadata" | "session"
> & {
  expiresAt: Date;
  metadata: PaymentMetadata[];
  session: NonNullable<PaymentRequestRecord["session"]>;
};

export interface CreatePaymentRequestCheckoutSessionInput {
  paymentRequest: PayablePaymentRequest;
  connectedAccountId: string;
}

export type PaymentRequestCheckoutSessionLocals = {
  paymentRequest: PayablePaymentRequest;
  connectedAccountId: string;
};

export type FetchPaymentRequestMiddleware = ValidatedRequestHandler<
  typeof createPaymentRequestCheckoutSessionSchema,
  CreateCheckoutSessionResponse,
  PaymentRequestCheckoutSessionLocals
>;

export type ResolvePaymentRequestConnectedAccountMiddleware =
  ValidatedRequestHandler<
    typeof createPaymentRequestCheckoutSessionSchema,
    CreateCheckoutSessionResponse,
    PaymentRequestCheckoutSessionLocals
  >;

export type CreatePaymentRequestCheckoutSessionController =
  ValidatedRequestHandler<
    typeof createPaymentRequestCheckoutSessionSchema,
    CreateCheckoutSessionResponse,
    PaymentRequestCheckoutSessionLocals
  >;
