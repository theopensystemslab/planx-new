import type { PaymentRequest } from "@opensystemslab/planx-core/types";
import gql from "graphql-tag";
import { client } from "lib/graphql";
import { paymentRequestContext } from "lib/graphql/contexts";
import { isPaymentRequestExpired } from "lib/pay";

/**
 * Payment request fields readable by the Hasura "public" role
 * (with the required PaymentRequestContext)
 */
export type PublicPaymentRequest = Pick<
  PaymentRequest,
  "id" | "sessionPreviewData" | "feeBreakdown" | "createdAt" | "paymentAmount"
> & {
  govPayPaymentId: string | null;
  stripePaymentId: string | null;
  paidAt: string | null;
};

export const getPaymentRequest = async (
  paymentRequestId: string,
): Promise<PublicPaymentRequest | undefined> => {
  try {
    const {
      data: {
        paymentRequests: [paymentRequest],
      },
    } = await client.query<{
      paymentRequests: PublicPaymentRequest[];
    }>({
      query: gql`
        query GetPaymentRequestById($id: uuid!) {
          paymentRequests: payment_requests(
            limit: 1
            where: { id: { _eq: $id } }
          ) {
            id
            sessionPreviewData: session_preview_data
            feeBreakdown: fee_breakdown
            createdAt: created_at
            paymentAmount: payment_amount
            govPayPaymentId: govpay_payment_id
            stripePaymentId: stripe_payment_id
            paidAt: paid_at
          }
        }
      `,
      variables: {
        id: paymentRequestId,
      },
      context: paymentRequestContext(paymentRequestId),
    });

    if (!paymentRequest || isPaymentRequestExpired(paymentRequest)) return;

    return paymentRequest;
  } catch (error) {
    console.error(error);
  }
};
