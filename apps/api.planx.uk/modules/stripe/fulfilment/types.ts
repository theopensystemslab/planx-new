import { z } from "zod";

import type { ValidatedRequestHandler } from "../../../shared/middleware/validate.js";

export const STRIPE_PASSPORT_KEY = "application.fee.reference.stripe";

/**
 * Reserved metadata set by PlanX on an invite to pay Checkout Session
 */
export const paymentRequestCheckoutMetadataSchema = z.object({
  sessionId: z.uuid(),
  origin: z.string(),
  paymentRequestId: z.uuid(),
});

/**
 * The status of a payment which has fulfilled a payment request
 *  - paid: Stripe has confirmed the payment
 *  - pending: authorised, but a delayed payment method (e.g. Bacs Direct Debit) hasn't confirmed yet
 */
export type FulfilledPaymentStatus = "paid" | "pending";

/**
 * The outcome of a fulfilment attempt
 */
export type FulfilmentResult =
  /** This call marked the payment request as paid */
  | {
      status: "fulfilled";
      stripePaymentId: string;
      paymentStatus: FulfilledPaymentStatus;
    }
  /** The payment request was already paid, nothing changed */
  | {
      status: "alreadyFulfilled";
      stripePaymentId: string | null;
      paymentStatus: FulfilledPaymentStatus;
    }
  /** Stripe hasn't taken payment for this Checkout Session */
  | { status: "unpaid" }
  /** Not an invite to pay Checkout Session (e.g. self-pay) */
  | { status: "notPaymentRequest" }
  /** Created by another environment sharing the Stripe sandbox */
  | { status: "foreign" }
  /** The payment request (or its session) doesn't exist in this environment */
  | { status: "notFound" }
  /** The Checkout Session doesn't belong to this payment request or session */
  | { status: "mismatch" };

export const fulfilPaymentRequestSchema = z.object({
  params: z.object({
    paymentRequestId: z.uuid(),
  }),
  body: z.object({
    checkoutSessionId: z.string().startsWith("cs_"),
  }),
});

export interface FulfilPaymentRequestResponse {
  paymentStatus: FulfilledPaymentStatus;
  paymentIntentId: string | null;
}

export type FulfilPaymentRequestController = ValidatedRequestHandler<
  typeof fulfilPaymentRequestSchema,
  FulfilPaymentRequestResponse
>;
