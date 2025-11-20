import { gql } from "graphql-request";
import { $api } from "../../../client/index.js";
import type {
  Session,
  TeamContactSettings,
} from "@opensystemslab/planx-core/types";
import type { TemplateRegistry } from "../../../lib/notify/templates/index.js";

interface GetTeamEmailSettings {
  teams: {
    teamSettings: TeamContactSettings;
  }[];
}

export async function getTeamEmailSettings(localAuthority: string) {
  const response = await $api.client.request<GetTeamEmailSettings>(
    gql`
      query GetTeamEmailSettings($slug: String) {
        teams(where: { slug: { _eq: $slug } }) {
          teamSettings: team_settings {
            helpEmail: help_email
            helpPhone: help_phone
            emailReplyToId: email_reply_to_id
            helpOpeningHours: help_opening_hours
            submissionEmail: submission_email
          }
        }
      }
    `,
    {
      slug: localAuthority,
    },
  );

  return response?.teams[0];
}

interface GetFlowId {
  lowcalSessions: {
    flowId: string;
  }[];
}

export async function getFlowId(sessionId: string) {
  const response = await $api.client.request<GetFlowId>(
    gql`
      query GetFlowId($session_id: uuid!) {
        lowcalSessions: lowcal_sessions(where: { id: { _eq: $session_id } }) {
          flowId: flow_id
        }
      }
    `,
    {
      session_id: sessionId,
    },
  );
  return response?.lowcalSessions[0]?.flowId;
}

interface GetFlowSubmissionEmail {
  flowIntegrations: {
    emailId: string;
    submissionIntegration: {
      submissionEmail: string;
    };
  }[];
}

export async function getFlowSubmissionEmail(flowId: string) {
  const response = await $api.client.request<GetFlowSubmissionEmail>(
    gql`
      query GetFlowSubmissionEmail($flowId: uuid!) {
        flowIntegrations: flow_integrations(
          where: { flow_id: { _eq: $flowId } }
        ) {
          emailId: email_id
          submissionIntegration: submission_integration {
            submissionEmail: submission_email
          }
        }
      }
    `,
    {
      flowId,
    },
  );
  return response?.flowIntegrations[0]?.submissionIntegration.submissionEmail;
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
    passportData: Record<string, unknown>;
    email: string;
    flow: {
      slug: string;
      name: string;
    };
  } | null;
}

export async function getSessionEmailDetailsById(sessionId: string) {
  const response = await $api.client.request<GetSessionEmailDetailsById>(
    gql`
      query GetSessionEmailDetails($id: uuid!) {
        session: lowcal_sessions_by_pk(id: $id) {
          passportData: data(path: "passport.data")
          email
          flow {
            slug
            name
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
  notifyRequest: TemplateRegistry["submit"]["config"],
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

interface FindApplication {
  emailApplications: {
    response: string;
  }[];
}

/**
 * Query the emails audit table to see if we already have an application for this session
 */
export async function checkEmailAuditTable(sessionId: string): Promise<string> {
  const application = await $api.client.request<FindApplication>(
    gql`
      query FindApplication($session_id: uuid!) {
        emailApplications: email_applications(
          where: {
            session_id: { _eq: $session_id }
            response: { _has_key: "message" }
          }
          order_by: { created_at: desc }
        ) {
          response: response(path: "message")
        }
      }
    `,
    {
      session_id: sessionId,
    },
  );

  return application?.emailApplications[0]?.response;
}
