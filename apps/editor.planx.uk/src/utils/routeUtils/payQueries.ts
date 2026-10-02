import gql from "graphql-tag";
import { client } from "lib/graphql";
import { paymentRequestContext } from "lib/graphql/contexts";
import { getRetentionPeriod } from "lib/pay";

export const getPaymentRequest = async (
  paymentRequestId: string,
): Promise<PaymentRequest | undefined> => {
  try {
    const {
      data: {
        paymentRequests: [paymentRequest],
      },
    } = await client.query<{
      paymentRequests: PaymentRequest[];
    }>({
      query: gql`
        query GetPaymentRequestById($id: uuid!, $retentionPeriod: timestamptz) {
          paymentRequests: payment_requests(
            limit: 1
            where: {
              id: { _eq: $id }
              paid_at: { _is_null: true }
              created_at: { _gt: $retentionPeriod }
            }
          ) {
            id
            sessionPreviewData: session_preview_data
            feeBreakdown: fee_breakdown
            createdAt: created_at
            paymentAmount: payment_amount
            govPayPaymentId: govpay_payment_id
            paidAt: paid_at
          }
        }
      `,
      variables: {
        id: paymentRequestId,
        retentionPeriod: getRetentionPeriod(),
      },
      context: paymentRequestContext(paymentRequestId),
    });
    return paymentRequest;
  } catch (error) {
    console.error(error);
  }
};
