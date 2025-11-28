import gql from "graphql-tag";

export const GET_FLOW_SETTINGS = gql`
  query GetFlowSettings($flowId: uuid!) {
    flow: flows_by_pk(id: $flowId) {
      id
      settings
    }
  }
`;

export const UPDATE_FLOW_SETTINGS = gql`
  mutation UpdateFlowSettings($flowId: uuid!, $settings: jsonb) {
    update_flows_by_pk(
      pk_columns: { id: $flowId }
      _set: { settings: $settings }
    ) {
      id
      settings
      hasPrivacyPage: settings(path: "elements.privacy.show")
    }
  }
`;
