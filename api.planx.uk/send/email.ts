import { gql } from "graphql-request";
import capitalize from "lodash/capitalize";

import { adminGraphQLClient as adminClient } from "../hasura";
import { markSessionAsSubmitted } from "../saveAndReturn/utils";
import { sendEmail } from "../notify";
import type { EmailSubmissionNotifyConfig } from "../types";

export async function sendToEmail({
  sessionId,
  localAuthority,
}: {
  sessionId: string;
  localAuthority: string;
}): Promise<unknown> {
  // Confirm this local authority (aka team) has an email configured in teams.submission_email
  const { sendToEmail, notifyPersonalisation } = await getTeamEmailSettings(
    localAuthority
  );
  if (!sendToEmail)
    throw new Error("Send to email is not enabled for this local authority.");

  // Get the applicant email and flow slug associated with the session
  const { email, flow } = await getSessionEmailDetailsById(sessionId);
  const flowName = capitalize(flow?.slug?.replaceAll("-", " "));

  const downloadLink = `${process.env.API_URL_EXT}/download-application-files/${sessionId}?email=${sendToEmail}&localAuthority=${localAuthority}`;

  const emailTemplateConfig: EmailSubmissionNotifyConfig = {
    personalisation: {
      serviceName: flowName || "PlanX",
      sessionId,
      applicantEmail: email,
      downloadLink,
      ...notifyPersonalisation,
    },
  };

  // Send the email
  const response = await sendEmail("submit", sendToEmail, emailTemplateConfig);
  if (response?.message !== "Success")
    throw new Error(`Failed to send "Submit" email: ${response?.message}`);
  // Mark session as submitted so that reminder and expiry emails are not triggered
  await markSessionAsSubmitted(sessionId);

  // Create audit table entry, which triggers a Slack notification on `insert` if production
  await insertAuditEntry({
    sessionId,
    teamSlug: localAuthority,
    recipient: sendToEmail,
    notifyRequest: emailTemplateConfig,
    sendEmailResponse: response,
  });

  return { message: `Successfully sent "Submit" email` };
}

export async function getTeamEmailSettings(localAuthority: string) {
  const response = await adminClient.request(
    gql`
      query GetTeamEmailSettings($slug: String) {
        teams(where: { slug: { _eq: $slug } }) {
          sendToEmail: submission_email
          notifyPersonalisation: notify_personalisation
        }
      }
    `,
    {
      slug: localAuthority,
    }
  );

  return response?.teams[0];
}

async function getSessionEmailDetailsById(sessionId: string) {
  const response = await adminClient.request(
    gql`
      query GetSessionEmailDetails($id: uuid!) {
        lowcal_sessions_by_pk(id: $id) {
          email
          flow {
            slug
          }
        }
      }
    `,
    {
      id: sessionId,
    }
  );

  return response?.lowcal_sessions_by_pk;
}

async function insertAuditEntry({
  sessionId,
  teamSlug,
  recipient,
  notifyRequest,
  sendEmailResponse,
}: {
  sessionId: string;
  teamSlug: string;
  recipient: string;
  notifyRequest: EmailSubmissionNotifyConfig;
  sendEmailResponse: {
    message: string;
    expiryDate?: string;
  };
}) {
  const response = await adminClient.request(
    gql`
      mutation CreateEmailApplication(
        $sessionId: uuid!
        $teamSlug: String
        $recipient: String
        $request: jsonb
        $response: jsonb
      ) {
        insert_email_applications_one(
          object: {
            session_id: $sessionId
            team_slug: $teamSlug
            recipient: $recipient
            request: $request
            response: $response
          }
        ) {
          id
        }
      }
    `,
    {
      sessionId,
      teamSlug,
      recipient,
      request: notifyRequest,
      response: sendEmailResponse,
    }
  );

  return response?.insert_email_applications_one?.id;
}

export async function findExistingEmailSumbission(
  sessionId: string
): Promise<boolean> {
  // TODO
  return Promise.resolve(false);
}
