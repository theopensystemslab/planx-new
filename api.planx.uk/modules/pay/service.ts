import { GovUKPayment } from "@opensystemslab/planx-core/types";
import { $api } from "../../client";
import { gql } from "graphql-request";

import SlackNotify from "slack-notify";
import { Request } from "express";

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

export async function postPaymentNotificationToSlack(
  req: Request,
  govUkResponse: GovUKPayment,
  label = "",
) {
  // if it's a prod payment, notify #planx-notifications so we can monitor for subsequent submissions
  if (govUkResponse?.payment_provider !== "sandbox") {
    const slack = SlackNotify(process.env.SLACK_WEBHOOK_URL!);
    const getStatus = (state: GovUKPayment["state"]) =>
      state.status + (state.message ? ` (${state.message})` : "");
    const payMessage = `:coin: New GOV Pay payment ${label} *${
      govUkResponse.payment_id
    }* with status *${getStatus(govUkResponse.state)}* [${
      req.params.localAuthority
    }]`;
    await slack.send(payMessage);
    console.log("Payment notification posted to Slack");
  }
}
