import { addDays, addHours, addMinutes, min, subMinutes } from "date-fns";
import { gql } from "graphql-request";

import { $api } from "../../../client/index.js";
import { DAYS_UNTIL_EXPIRY } from "../../saveAndReturn/service/utils.js";
import type { PaymentRequestRecord } from "./types.js";

export const getPaymentRequest = async (
  paymentRequestId: string,
): Promise<PaymentRequestRecord | null> => {
  const { paymentRequest } = await $api.client.request<{
    paymentRequest: PaymentRequestRecord | null;
  }>(
    gql`
      query GetPaymentRequestForCheckout($paymentRequestId: uuid!) {
        paymentRequest: payment_requests_by_pk(id: $paymentRequestId) {
          id
          sessionId: session_id
          payeeEmail: payee_email
          paymentAmount: payment_amount
          feeBreakdown: fee_breakdown
          stripeMetadata: stripe_metadata
          govPayMetadata: govpay_metadata
          createdAt: created_at
          paidAt: paid_at
          govPayPaymentId: govpay_payment_id
          session {
            flowId: flow_id
            deletedAt: deleted_at
            lockedAt: locked_at
            passport: data(path: "passport")
            flow {
              slug
              team {
                slug
                domain
              }
            }
          }
        }
      }
    `,
    { paymentRequestId },
  );

  return paymentRequest;
};

export const getPaymentRequestExpiry = (createdAt: string): Date =>
  addDays(new Date(createdAt), DAYS_UNTIL_EXPIRY);

/**
 * Stripe requires a Checkout Session to expire between 30 minutes and 24 hours after it's created
 * Keep clear of both limits to allow for some request latency
 *
 * @docs https://docs.stripe.com/api/checkout/sessions/create#create_checkout_session-expires_at
 */
const EXPIRY_BUFFER_MINUTES = 5;

export const getMinimumCheckoutSessionExpiry = (now: Date): Date =>
  addMinutes(now, 30 + EXPIRY_BUFFER_MINUTES);

/**
 * Ensure that expired payments cannot be paid for
 */
export const getCheckoutSessionExpiry = (
  paymentRequestExpiresAt: Date,
  now: Date,
): Date =>
  min([
    paymentRequestExpiresAt,
    subMinutes(addHours(now, 24), EXPIRY_BUFFER_MINUTES),
  ]);
