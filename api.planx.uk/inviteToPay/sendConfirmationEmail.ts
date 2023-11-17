import { $public, $api } from "../client";
import { sendEmail } from "../lib/notify";
import { gql } from "graphql-request";
import { convertSlugToName } from "../modules/saveAndReturn/service/utils";
import type { AgentAndPayeeSubmissionNotifyConfig } from "../types";

export async function sendAgentAndPayeeConfirmationEmail(sessionId: string) {
  const { personalisation, applicantEmail, payeeEmail, projectTypes } =
    await getDataForPayeeAndAgentEmails(sessionId);
  const projectType = projectTypes.length
    ? await $public.formatRawProjectTypes(projectTypes)
    : "Project type not submitted";
  const config: AgentAndPayeeSubmissionNotifyConfig = {
    personalisation: {
      ...personalisation,
      projectType,
    },
  };
  await sendEmail("confirmation-agent", applicantEmail, config);
  await sendEmail("confirmation-payee", payeeEmail, config);
  return { message: "Success" };
}

type PayeeAndAgentEmailData = {
  personalisation: {
    emailReplyToId: string;
    helpEmail: string;
    helpOpeningHours: string;
    helpPhone: string;
    serviceName: string;
    payeeName: string;
    address: string;
    applicantName: string;
  };
  applicantEmail: string;
  payeeEmail: string;
  projectTypes: string[];
};

async function getDataForPayeeAndAgentEmails(
  sessionId: string,
): Promise<PayeeAndAgentEmailData> {
  const query = gql`
    query GetDataForPayeeAndAgentEmails($sessionId: uuid!) {
      lowcal_sessions(where: { id: { _eq: $sessionId } }, limit: 1) {
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
          address: session_preview_data(path: "_address.title")
          projectTypes: session_preview_data(path: "['proposal.projectType']")
          payeeEmail: payee_email
          payeeName: payee_name
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
        address: string;
        projectTypes: string[];
        payeeEmail: string;
        payeeName: string;
        applicantName: string;
      }[];
    }[];
  } = await $api.client.request(query, { sessionId });
  const data = response.lowcal_sessions[0];
  const { emailReplyToId, helpEmail, helpOpeningHours, helpPhone } =
    data.flow.team.notifyPersonalisation;
  const serviceName = convertSlugToName(data.flow.slug);
  const applicantEmail = data.email;
  const { payeeEmail, payeeName, address, projectTypes, applicantName } =
    data.paymentRequests[0];
  return {
    personalisation: {
      emailReplyToId,
      helpEmail,
      helpOpeningHours,
      helpPhone,
      serviceName,
      payeeName,
      address,
      applicantName,
    },
    applicantEmail,
    payeeEmail,
    projectTypes,
  };
}
