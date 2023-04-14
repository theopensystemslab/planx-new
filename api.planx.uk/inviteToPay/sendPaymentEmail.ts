import { gql } from "graphql-request";
import { Template, calculateExpiryDate, convertSlugToName, getClientForTemplate, getHumanReadableProjectType, sendEmail } from "../saveAndReturn/utils";
import { InviteToPayNotifyConfig } from "../types";

const sendSinglePaymentEmail = async (
  template: Template,
  paymentRequestId: string,
) => {
  try {
    const payment = await validatePaymentRequest(paymentRequestId, template);
    if (!payment) throw Error("Unable to send payment email, cannot find payment request");
    const humanReadableProjectType = await getHumanReadableProjectType(payment.session_preview_data);

    const config: InviteToPayNotifyConfig = {
      personalisation: {
        id: payment.session_id,
        serviceName: convertSlugToName(payment.session.flow.slug),
        emailReplyToId: payment.session.flow.team.notify_personalisation.emailReplyToId,
        helpEmail: payment.session.flow.team.notify_personalisation.helpEmail,
        helpOpeningHours: payment.session.flow.team.notify_personalisation.helpOpeningHours,
        helpPhone: payment.session.flow.team.notify_personalisation.helpPhone,
        paymentRequestId: paymentRequestId,
        payeeEmail: payment.payee_email,
        payeeName: payment.payee_name,
        agentName: payment.applicant_name,
        paymentLink: `https://${payment.session.flow.team.domain}/${payment.session.flow.slug}/pay?paymentRequestId=${paymentRequestId}`,
        fee: Number(payment.payment_amount).toLocaleString("en-GB", { style: "currency", currency: "GBP" }),
        projectType: humanReadableProjectType || "Project type not submitted",
        address: payment.session_preview_data?._address.title,
        expiryDate: calculateExpiryDate(payment.created_at),
      }
    };

    const recipient = template.includes("-agent") ? payment.session.email : payment.payee_email;
    return await sendEmail(template, recipient, config);
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
          applicant_name
          payment_amount
          session_id
          session_preview_data
          created_at
          paid_at
          session {
            email
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
    if (paymentRequest?.paid_at) throw Error(`Invalid payment request, already paid`);
    
    return paymentRequest;
  } catch (error) {
    throw Error(`Unable to validate payment request. ${(error as Error).message}`);
  }
};

export {
  sendSinglePaymentEmail
};
