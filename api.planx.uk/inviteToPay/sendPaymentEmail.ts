import { gql } from "graphql-request";
import { Template, calculateExpiryDate, convertSlugToName, getClientForTemplate, sendEmail } from "../saveAndReturn/utils";
import { InviteToPayNotifyConfig } from "../types";

const sendSinglePaymentEmail = async (
  template: Template,
  paymentRequestId: string,
) => {
  try {
    const payment = await validatePaymentRequest(paymentRequestId, template);
    if (!payment || Boolean(payment?.paid_at)) throw Error(`Invalid payment request: ${paymentRequestId}`);

    const config: InviteToPayNotifyConfig = {
      personalisation: {
        id: payment.session_id,
        serviceName: convertSlugToName(payment.session.flow.slug),
        emailReplyToId: payment.session.flow.notify_personalisation.emailReplyToId,
        helpEmail: payment.session.flow.notify_personalisation.helpEmail,
        helpOpeningHours: payment.session.flow.notify_personalisation.helpOpeningHours,
        helpPhone: payment.session.flow.notify_personalisation.helpPhone,
        paymentRequestId: paymentRequestId,
        payeeEmail: payment.payee_email,
        payeeName: payment.payee_name,
        agentName: "TODO",
        paymentLink: `${payment.session.team.domain}/${payment.flow.slug}/pay?paymentRequestId=${paymentRequestId}`,
        fee: payment.session_preview_data.fee,
        projectType: payment.session_preview_data.project_type,
        address: payment.session_preview_data.address,
        expiryDate: calculateExpiryDate(payment.created_at),
      }
    };
    return await sendEmail(template, payment.payee_email, config);
  } catch (error) {
    throw Error((error as Error).message);
  }
};

const validatePaymentRequest = async (
  paymentRequestId: string,
  template: Template,
) => {
  try {
    const query = gql`
      query ValidatePaymentRequest($paymentRequestId: uuid!) {
        payment_requests_by_pk(id: $paymentRequestId) {
          payee_email
          payee_name
          session_id
          session_preview_data
          created_at
          paid_at
          session {
            flow {
              slug
              team {
                name
                slug
                domain
                notify_personalisation
              }
            }
          }
        }
      }
    `;
    const client = getClientForTemplate(template);
    const headers = { "x-hasura-payment-request-id": paymentRequestId }
    const { payment_requests_by_pk: paymentRequest } = await client.request(query, { paymentRequestId }, headers);

    if (!paymentRequest) throw Error(`Unable to find payment request: ${paymentRequestId}`);
    
    return paymentRequest;
  } catch (error) {
    throw Error(`Unable to validate payment request. ${(error as Error).message}`);
  }
};

export {
  sendSinglePaymentEmail
};
