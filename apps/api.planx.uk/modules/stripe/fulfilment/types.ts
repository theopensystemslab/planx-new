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
 * The status of a payment request's payment, as reported to the payer's return page
 *  - paid: Stripe has confirmed the payment, and the request is fulfilled
 *  - pending: a delayed payment method (e.g. Bacs Direct Debit) hasn't succeeded yet - the request is fulfilled once it does
 */
export type PaymentRequestPaymentStatus = "paid" | "pending";

/**
 * The outcome of a fulfilment attempt
 */
export type FulfilmentResult =
  /** This call marked the payment request as paid */
  | { status: "fulfilled"; stripePaymentId: string }
  /** The payment request was already paid, nothing changed */
  | { status: "alreadyFulfilled"; stripePaymentId: string | null }
  /** Checkout is complete, but a delayed payment (e.g. Bacs) hasn't succeeded yet - nothing changed */
  | { status: "pending"; stripePaymentId: string }
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
  paymentStatus: PaymentRequestPaymentStatus;
  paymentIntentId: string | null;
}

export type FulfilPaymentRequestController = ValidatedRequestHandler<
  typeof fulfilPaymentRequestSchema,
  FulfilPaymentRequestResponse
>;
