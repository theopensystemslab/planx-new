import { formatRawProjectTypes } from "@opensystemslab/planx-core";
import type { PaymentRequest } from "@opensystemslab/planx-core/types";
import { gql } from "graphql-request";
import {
  Template,
  getClientForTemplate,
  sendEmail,
} from "../../../../lib/notify";
import { InviteToPayNotifyConfig, Team } from "../../../../types";
import {
  calculateExpiryDate,
  getServiceLink,
} from "../../../saveAndReturn/service/utils";

interface SessionDetails {
  email: string;
  flow: {
    slug: string;
    name: string;
    team: Team;
  };
}

interface ValidatePaymentRequest {
  query: PaymentRequest & { session: SessionDetails };
}

const sendSinglePaymentEmail = async ({
  template,
  paymentRequestId,
}: {
  template: Template;
  paymentRequestId: string;
}) => {
  try {
    const { session, paymentRequest } = await validatePaymentRequest(
      paymentRequestId,
      template,
    );
    const config = getInviteToPayNotifyConfig(session, paymentRequest);
    const recipient = template.includes("-agent")
      ? session.email
      : paymentRequest.payeeEmail;
    return await sendEmail(template, recipient, config);
  } catch (error) {
    throw Error((error as Error).message);
  }
};

const validatePaymentRequest = async (
  paymentRequestId: string,
  template: Template,
): Promise<{ session: SessionDetails; paymentRequest: PaymentRequest }> => {
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
              name
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
    const headers = { "x-hasura-payment-request-id": paymentRequestId };
    const {
      query: { session, ...paymentRequest },
    } = await client.request<ValidatePaymentRequest>(
      query,
      { paymentRequestId },
      headers,
    );

    if (!paymentRequest)
      throw Error(`Unable to find payment request: ${paymentRequestId}`);
    if (paymentRequest?.paidAt)
      throw Error(`Invalid payment request, already paid`);

    return { session, paymentRequest };
  } catch (error) {
    throw Error(
      `Unable to validate payment request. ${(error as Error).message}`,
    );
  }
};

const getInviteToPayNotifyConfig = (
  session: SessionDetails,
  paymentRequest: PaymentRequest,
): InviteToPayNotifyConfig => ({
  personalisation: {
    ...session.flow.team.notifyPersonalisation,
    sessionId: paymentRequest.sessionId,
    paymentRequestId: paymentRequest.id,
    payeeEmail: paymentRequest.payeeEmail,
    payeeName: paymentRequest.payeeName,
    agentName: paymentRequest.applicantName,
    address: (
      paymentRequest.sessionPreviewData?._address as Record<"title", string>
    ).title,
    fee: getFee(paymentRequest),
    projectType:
      formatRawProjectTypes(
        paymentRequest.sessionPreviewData?.["proposal.projectType"] as string[],
      ) || "Project type not submitted",
    serviceName: session.flow.name,
    serviceLink: getServiceLink(session.flow.team, session.flow.slug),
    expiryDate: calculateExpiryDate(paymentRequest.createdAt),
    paymentLink: getPaymentLink(session, paymentRequest),
  },
});

const getFee = (paymentRequest: PaymentRequest) => {
  const toPounds = (pence: number) => pence / 100;
  const fee = toPounds(paymentRequest.paymentAmount).toLocaleString("en-GB", {
    style: "currency",
    currency: "GBP",
  });
  return fee;
};

const getPaymentLink = (
  session: SessionDetails,
  paymentRequest: PaymentRequest,
) => {
  const {
    flow: {
      slug: flowSlug,
      team: { domain, slug: teamSlug },
    },
  } = session;
  // Use custom domain if available or fall back to PlanX URL
  const serviceURL = domain
    ? `https://${domain}/${flowSlug}`
    : `${process.env.EDITOR_URL_EXT}/${teamSlug}/${flowSlug}`;
  return `${serviceURL}/pay?paymentRequestId=${paymentRequest.id}`;
};

export { sendSinglePaymentEmail };
