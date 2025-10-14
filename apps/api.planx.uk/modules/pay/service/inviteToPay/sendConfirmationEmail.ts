import { formatRawProjectTypes } from "@opensystemslab/planx-core";
import { gql } from "graphql-request";
import { $api } from "../../../../client/index.js";
import { sendEmail } from "../../../../lib/notify/index.js";
import type { TemplateRegistry } from "../../../../lib/notify/templates/index.js";

export async function sendAgentAndPayeeConfirmationEmail(sessionId: string) {
  const {
    personalisation,
    applicantEmail,
    payeeEmail,
    projectTypes,
    emailReplyToId,
  } = await getDataForPayeeAndAgentEmails(sessionId);
  const projectType = projectTypes.length
    ? formatRawProjectTypes(projectTypes)
    : "Project type not submitted";
  const config = {
    personalisation: {
      ...personalisation,
      projectType,
    },
    emailReplyToId,
  };
  await sendEmail("confirmation-agent", applicantEmail, config);
  await sendEmail("confirmation-payee", payeeEmail, config);

  return { message: "Success" };
}

type PayeeAndAgentPersonalisation = Omit<
  TemplateRegistry["confirmation-payee"]["config"]["personalisation"] &
    TemplateRegistry["confirmation-agent"]["config"]["personalisation"],
  "projectType"
>;

type PayeeAndAgentEmailData = {
  personalisation: PayeeAndAgentPersonalisation;
  applicantEmail: string;
  payeeEmail: string;
  projectTypes: string[];
  emailReplyToId: string;
};

async function getDataForPayeeAndAgentEmails(
  sessionId: string,
): Promise<PayeeAndAgentEmailData> {
  const query = gql`
    query GetDataForPayeeAndAgentEmails($sessionId: uuid!) {
      lowcal_sessions(where: { id: { _eq: $sessionId } }, limit: 1) {
        email
        flow {
          name
          slug
          team {
            notifyPersonalisation: team_settings {
              helpEmail: help_email
              helpPhone: help_phone
              emailReplyToId: email_reply_to_id
              helpOpeningHours: help_opening_hours
            }
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
        name: string;
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
  const serviceName = data.flow.name;
  const applicantEmail = data.email;
  const { payeeEmail, payeeName, address, projectTypes, applicantName } =
    data.paymentRequests[0];
  return {
    emailReplyToId,
    personalisation: {
      helpEmail,
      helpOpeningHours,
      helpPhone,
      serviceName,
      payeeName,
      address,
      applicantName,
      sessionId,
    },
    applicantEmail,
    payeeEmail,
    projectTypes,
  };
}
