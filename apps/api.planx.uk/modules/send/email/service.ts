import { gql } from "graphql-request";
import { $api } from "../../../client/index.js";
import type {
  Session,
  TeamContactSettings,
} from "@opensystemslab/planx-core/types";
import type { TemplateRegistry } from "../../../lib/notify/templates/index.js";

interface GetTeamEmailSettings {
  teams: {
    id: number;
    teamSettings: TeamContactSettings;
  }[];
}

export async function getTeamEmailSettings(localAuthority: string) {
  const response = await $api.client.request<GetTeamEmailSettings>(
    gql`
      query GetTeamEmailSettings($slug: String) {
        teams(where: { slug: { _eq: $slug } }) {
          id
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

interface GetPublishedFlowIntegration {
  publishedFlows: {
    submissionIntegration: {
      submissionEmail: string;
    };
  }[];
}

async function getPublishedFlowIntegration(flowId: string) {
  const response = await $api.client.request<GetPublishedFlowIntegration>(
    gql`
      query GetPublishedFlowIntegration($flowId: uuid!) {
        publishedFlows: published_flows(
          where: { flow_id: { _eq: $flowId } }
          order_by: [{ flow_id: asc }, { created_at: desc }]
          limit: 1
        ) {
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
  return response?.publishedFlows[0]?.submissionIntegration?.submissionEmail;
}

interface GetDefaultSubmissionIntegration {
  submissionIntegrations: {
    submissionEmail: string;
  }[];
}

async function getDefaultSubmissionIntegration(teamId: number) {
  const response = await $api.client.request<GetDefaultSubmissionIntegration>(
    gql`
      query getDefaultSubmissionIntegration($teamId: Int!) {
        submissionIntegrations: submission_integrations(
          where: { team_id: { _eq: $teamId }, default_email: { _eq: true } }
        ) {
          submissionEmail: submission_email
        }
      }
    `,
    {
      teamId,
    },
  );
  return response?.submissionIntegrations[0]?.submissionEmail;
}

export async function getSubmissionEmail(flowId: string, teamId: number) {
  // First get the ID to so we can fetch the relevant email; there is no relationship between `published_flows` and `submission_integrations` currently
  let submissionEmail = await getPublishedFlowIntegration(flowId);

  // If there is no submission email found for this flow, get the default submission integration for this team
  if (!submissionEmail) {
    submissionEmail = await getDefaultSubmissionIntegration(teamId);
  }

  return submissionEmail;
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
