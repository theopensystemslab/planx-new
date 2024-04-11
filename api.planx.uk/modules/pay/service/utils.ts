import { GovUKPayment } from "@opensystemslab/planx-core/types";
import { $api } from "../../../client";
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

/**
 * Identify if a payment is using dummy card details for testing
 * Docs: https://docs.payments.service.gov.uk/testing_govuk_pay/#mock-card-numbers-and-email-addresses
 */
export const isTestPayment = ({
  payment_provider: paymentProvider,
}: GovUKPayment) => {
  // Payment using "sandbox" account
  const isSandbox = paymentProvider === "sandbox";
  const isProduction = process.env.APP_ENVIRONMENT === "production";

  // Payment using Stripe in non-production environment
  // Stripe test accounts do not have a specific test code
  const isStripeTest = paymentProvider === "stripe" && !isProduction;

  return isSandbox || isStripeTest;
};

/**
 * Notify #planx-notifications so we can monitor for subsequent submissions
 */
export async function postPaymentNotificationToSlack(
  req: Request,
  govUkResponse: GovUKPayment,
  label = "",
) {
  if (isTestPayment(govUkResponse)) return;

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
