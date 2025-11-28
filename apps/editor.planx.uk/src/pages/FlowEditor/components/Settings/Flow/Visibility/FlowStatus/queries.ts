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
