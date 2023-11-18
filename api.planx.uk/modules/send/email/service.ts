import { gql } from "graphql-request";
import { $api } from "../../../client";
import { NotifyPersonalisation } from "@opensystemslab/planx-core/dist/types/team";
import { Session } from "@opensystemslab/planx-core/types";
import { EmailSubmissionNotifyConfig } from "../../../types";

interface GetTeamEmailSettings {
  teams: {
    sendToEmail: string;
    notifyPersonalisation: NotifyPersonalisation;
  }[];
}

export async function getTeamEmailSettings(localAuthority: string) {
  const response = await $api.client.request<GetTeamEmailSettings>(
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
    },
  );

  return response?.teams[0];
}

interface GetSessionData {
  session: Partial<Pick<Session, "data">>;
}

export async function getSessionData(sessionId: string) {
  const response = await $api.client.request<GetSessionData>(
    gql`
      query GetSessionData($id: uuid!) {
        session: lowcal_sessions_by_pk(id: $id) {
          data
        }
      }
    `,
    {
      id: sessionId,
    },
  );

  return response?.session?.data;
}

interface GetSessionEmailDetailsById {
  session: {
    email: string;
    flow: {
      slug: string;
    };
  } | null;
}

export async function getSessionEmailDetailsById(sessionId: string) {
  const response = await $api.client.request<GetSessionEmailDetailsById>(
    gql`
      query GetSessionEmailDetails($id: uuid!) {
        session: lowcal_sessions_by_pk(id: $id) {
          email
          flow {
            slug
          }
        }
      }
    `,
    {
      id: sessionId,
    },
  );

  if (!response.session)
    throw Error(
      `Cannot find session ${sessionId} in GetSessionEmailDetails query`,
    );

  return response.session;
}

interface CreateEmailApplication {
  application: {
    id?: string;
  };
}

export async function insertAuditEntry(
  sessionId: string,
  teamSlug: string,
  recipient: string,
  notifyRequest: EmailSubmissionNotifyConfig,
  sendEmailResponse: {
    message: string;
    expiryDate?: string;
  },
) {
  const response = await $api.client.request<CreateEmailApplication>(
    gql`
      mutation CreateEmailApplication(
        $session_id: uuid!
        $team_slug: String
        $recipient: String
        $request: jsonb
        $response: jsonb
      ) {
        application: insert_email_applications_one(
          object: {
            session_id: $session_id
            team_slug: $team_slug
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
      session_id: sessionId,
      team_slug: teamSlug,
      recipient: recipient,
      request: notifyRequest,
      response: sendEmailResponse,
    },
  );

  return response?.application?.id;
}
