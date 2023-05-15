import { _admin as $admin } from "../client";
import { sendEmail } from "../notify";
import { gql } from "graphql-request";
import type { AgentAndPayeeSubmissionNotifyConfig } from "../types";

export async function sendAgentAndPayeeConfirmationEmail(sessionId: string) {
  const { personalisation, agentEmail, payeeEmail } =
    await getDataForPayeeAndAgentEmails(sessionId);
  const config = { personalisation };
  await sendEmail("confirmation-agent", agentEmail, config);
  await sendEmail("confirmation-payee", payeeEmail, config);
  return { message: "Success" };
}

type PayeeAndAgentEmailData = {
  personalisation: {
    emailReplyToId: string;
    applicantEmail: string;
    helpEmail: string;
    helpOpeningHours: string;
    helpPhone: string;
    serviceName: string;
  };
  agentEmail: string;
  payeeEmail: string;
};

async function getDataForPayeeAndAgentEmails(
  sessionId: string
): Promise<PayeeAndAgentEmailData> {
  const query = gql`
    query GetDataForPayeeAndAgentEmails($sessionId: uuid!) {
      lowcal_sessions(
        where: { id: { _eq: $sessionId } }
        locked_at: { _is_null: false }
        limit: 1
      ) {
        email
        flow {
          slug
          team {
            notifyPersonalisation: notify_personalisation
          }
        }
        paymentRequests: payment_requests(
          order_by: { created_at: desc }
          limit: 1
        ) {
          payeeEmail: payee_email
          payeeName: payee_name
          paymentAmount: payment_amount
          applicantName: applicant_name
        }
      }
    }
  `;
  const response: {
    lowcal_sessions: {
      email: string;
      flow: {
        slug: string;
        team: {
          notifyPersonalisation: {
            emailReplyToId: string;
            helpEmail: string;
            helpOpeningHours: string;
            helpPhone: string;
          };
        };
      };
      paymentRequests: {
        payeeEmail: string;
        payeeName: string;
        paymentAmount: string;
        applicantName: string;
      }[];
    }[];
  } = await $admin.client.request(query, { sessionId });
  const data = response.lowcal_sessions[0];
  const { emailReplyToId, helpEmail, helpOpeningHours, helpPhone } =
    data.flow.team.notifyPersonalisation;
  const serviceName = convertSlugToName(data.flow.slug);
  const applicantEmail = data.email;
  const payeeEmail = data.paymentRequests[0].payeeEmail;
  return {
    personalisation: {
      applicantEmail,
      emailReplyToId,
      helpEmail,
      helpOpeningHours,
      helpPhone,
      serviceName,
    },
    agentEmail: applicantEmail,
    payeeEmail,
  };
}

/**
 * Converts a flow's slug to a pretty name
 * XXX: This relies on pretty names not having dashes in them, which may not always be true (e.g. Na h-Eileanan Siar, Stoke-on-Trent)
 */
const convertSlugToName = (slug: string): string =>
  slug[0].toUpperCase() + slug.substring(1).replaceAll("-", " ");
