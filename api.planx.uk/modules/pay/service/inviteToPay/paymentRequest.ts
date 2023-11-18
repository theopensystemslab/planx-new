import { gql } from "graphql-request";
import { Request } from "express";
import { fetchPaymentViaProxyWithCallback } from "../../controller";
import { GovUKPayment } from "@opensystemslab/planx-core/types";
import { $api } from "../../../../client";
import { postPaymentNotificationToSlack } from "../utils";

export const fetchPaymentRequestViaProxy = fetchPaymentViaProxyWithCallback(
  async (req: Request, govUkResponse: GovUKPayment) => {
    const paymentRequestId = req.params.paymentRequest;
    if (paymentRequestId && govUkResponse?.state.status === "success") {
      await markPaymentRequestAsPaid(paymentRequestId, govUkResponse);
    }
    await postPaymentNotificationToSlack(req, govUkResponse, "(invite to pay)");
  },
);

interface MarkPaymentRequestAsPaid {
  updatePaymentRequestPaidAt: {
    affectedRows: number;
  };
  appendGovUKPaymentToSessionData: {
    affectedRows: number;
  };
}

export const markPaymentRequestAsPaid = async (
  paymentRequestId: string,
  govUkPayment: GovUKPayment,
) => {
  const query = gql`
    mutation MarkPaymentRequestAsPaid(
      $paymentRequestId: uuid!
      $govUkPayment: jsonb
    ) {
      updatePaymentRequestPaidAt: update_payment_requests(
        where: {
          _and: { id: { _eq: $paymentRequestId }, paid_at: { _is_null: true } }
        }
        _set: { paid_at: "now()" }
      ) {
        affectedRows: affected_rows
      }

      # This will also overwrite any abandoned payments attempted on the session
      appendGovUKPaymentToSessionData: update_lowcal_sessions(
        _append: { data: $govUkPayment }
        where: { payment_requests: { id: { _eq: $paymentRequestId } } }
      ) {
        affectedRows: affected_rows
      }
    }
  `;
  try {
    const { updatePaymentRequestPaidAt, appendGovUKPaymentToSessionData } =
      await $api.client.request<MarkPaymentRequestAsPaid>(query, {
        paymentRequestId,
        govUkPayment: { govUkPayment },
      });
    if (!updatePaymentRequestPaidAt?.affectedRows) {
      throw Error(`payment request ${paymentRequestId} not updated`);
    }
    if (!appendGovUKPaymentToSessionData?.affectedRows) {
      throw Error(
        `session for payment request ${paymentRequestId} not updated`,
      );
    }
  } catch (error) {
    throw Error("Error marking payment request as paid: " + error);
  }
};
