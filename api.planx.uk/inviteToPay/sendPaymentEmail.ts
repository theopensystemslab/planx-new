import { PaymentRequest } from '@opensystemslab/planx-core';
import { gql } from "graphql-request";
import { calculateExpiryDate, convertSlugToName, getHumanReadableProjectType } from "../saveAndReturn/utils";
import { Template, getClientForTemplate, sendEmail } from "../notify/utils";
import { InviteToPayNotifyConfig } from "../types";
import { Team } from '../types';

interface SessionDetails {
  email: string;
  flow: {
    slug: string;
    team: Team;
  }
};

interface ValidatePaymentRequest {
  query: PaymentRequest & { session: SessionDetails }
};

const sendSinglePaymentEmail = async (
  template: Template,
  paymentRequestId: string,
) => {
  try {
    const { session, paymentRequest } = await validatePaymentRequest(paymentRequestId, template);
    if (!session || !paymentRequest) throw Error(`Invalid payment request: ${paymentRequestId}`);
    const config = await getInviteToPayNotifyConfig(session, paymentRequest);
    const recipient = template.includes("-agent") ? session.email : paymentRequest.payeeEmail;
    return await sendEmail(template, recipient, config);
  } catch (error) {
    throw Error((error as Error).message);
  }
};

const validatePaymentRequest = async (
  paymentRequestId: string,
  template: Template,
): Promise<{ session: SessionDetails, paymentRequest: PaymentRequest }> => {
  try {
    const query = gql`
      query ValidatePaymentRequest($paymentRequestId: uuid!) {
        query: payment_requests_by_pk(id: $paymentRequestId) {
          id
          payeeEmail: payee_email
          payeeName: payee_name
          sessionId: session_id
          sessionPreviewData: session_preview_data
          createdAt: created_at
          applicantName: applicant_name
          paidAt: paid_at
          paymentAmount: payment_amount
          session {
            email
            flow {
              slug
              team {
                id
                name
                slug
                domain
                notifyPersonalisation: notify_personalisation
              }
            }
          }
        }
      }
    `;
    const client = getClientForTemplate(template);
    const headers = { "x-hasura-payment-request-id": paymentRequestId }
    const { query: { session, ...paymentRequest } } = await client.request<ValidatePaymentRequest>(query, { paymentRequestId }, headers);

    if (!paymentRequest) throw Error(`Unable to find payment request: ${paymentRequestId}`);
    if (paymentRequest?.paidAt) throw Error(`Invalid payment request, already paid`);

    return { session, paymentRequest }
  } catch (error) {
    throw Error(`Unable to validate payment request. ${(error as Error).message}`);
  }
};

const getInviteToPayNotifyConfig = async (session: SessionDetails, paymentRequest: PaymentRequest): Promise<InviteToPayNotifyConfig> => ({
  personalisation: {
    ...session.flow.team.notifyPersonalisation,
    id: paymentRequest.sessionId,
    paymentRequestId: paymentRequest.id,
    payeeEmail: paymentRequest.payeeEmail,
    payeeName: paymentRequest.payeeName,
    agentName: paymentRequest.applicantName,
    address: (paymentRequest.sessionPreviewData?._address as Record<"title", string>).title,
    fee: getFee(paymentRequest),
    projectType: await getHumanReadableProjectType(paymentRequest.sessionPreviewData) || "Project type not submitted",
    serviceName: convertSlugToName(session.flow.slug),
    expiryDate: calculateExpiryDate(paymentRequest.createdAt),
    paymentLink: getPaymentLink(session, paymentRequest),
  }
});

const getFee = (paymentRequest: PaymentRequest) => {
  const toPounds = (pence: number) => pence / 100;
  const fee = toPounds(paymentRequest.paymentAmount).toLocaleString("en-GB", { style: "currency", currency: "GBP" });
  return fee;
};

const getPaymentLink = (session: SessionDetails, paymentRequest: PaymentRequest) => {
  const {
    flow: {
      slug: flowSlug,
      team: {
        domain,
        slug: teamSlug,
      },
    },
  } = session
  // Use custom domain if available or fall back to PlanX URL
  const serviceURL = domain ? `https://${domain}/${flowSlug}` : `${process.env.EDITOR_URL_EXT}/${teamSlug}/${flowSlug}`;
  return `${serviceURL}/pay?paymentRequestId=${paymentRequest.id}`
};

export { sendSinglePaymentEmail };