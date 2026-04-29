import { useQuery } from "@apollo/client";
import gql from "graphql-tag";

export const GET_FLOW_STATUS = gql`
  query GetFlowStatus($flowId: uuid!) {
    flow: flows_by_pk(id: $flowId) {
      id
      status
      hasPrivacyPage: settings(path: "elements.privacy.show")
      team {
        settings: team_settings {
          isTrial: is_trial
        }
      }
      templatedFrom: templated_from
      publishedFlows: published_flows(limit: 1) {
        id
      }
      firstOnlineAt: first_online_at
    }
  }
`;
export const UPDATE_FLOW_STATUS = gql`
  mutation SetFlowStatus($flowId: uuid!, $status: flow_status_enum_enum!) {
    flow: update_flows_by_pk(
      pk_columns: { id: $flowId }
      _set: { status: $status }
    ) {
      id
      status
      first_online_at
    }
  }
`;

export const GET_ACTIVE_SESSIONS = gql`
  query GetActiveSessions($flowId: uuid!) {
    lowcalSessions: lowcal_sessions(
      where: {
        flow_id: { _eq: $flowId }
        deleted_at: { _is_null: true }
        submitted_at: { _is_null: true }
        sanitised_at: { _is_null: true }
      }
    ) {
      id
    }
  }
`;

type GetActiveSessionsQuery = {
  lowcalSessions: {
    id: string;
  }[];
};

type GetActiveSessionsVars = { flowId: string };

export const useGetActiveSessions = (flowId: string) => {
  return useQuery<GetActiveSessionsQuery, GetActiveSessionsVars>(
    GET_ACTIVE_SESSIONS,
    {
      variables: { flowId },
    },
  );
};
