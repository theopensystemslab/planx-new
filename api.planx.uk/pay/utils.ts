import { GovUKPayment } from "@opensystemslab/planx-core/types";
import { $api } from "../client";
import { gql } from "graphql-request";

export const addGovPayPaymentIdToPaymentRequest = async (
  paymentRequestId: string,
  govUKPayment: GovUKPayment,
): Promise<void> => {
  const query = gql`
    mutation AddGovPayPaymentIdToPaymentRequest(
      $paymentRequestId: uuid!
      $govPayPaymentId: String
    ) {
      update_payment_requests_by_pk(
        pk_columns: { id: $paymentRequestId }
        _set: { govpay_payment_id: $govPayPaymentId }
      ) {
        id
      }
    }
  `;
  try {
    await $api.client.request(query, {
      paymentRequestId,
      govPayPaymentId: govUKPayment.payment_id,
    });
  } catch (error) {
    throw Error(`payment request ${paymentRequestId} not updated`);
  }
};
