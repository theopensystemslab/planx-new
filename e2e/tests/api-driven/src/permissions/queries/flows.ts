import { gql } from "graphql-tag";

export const INSERT_FLOW_QUERY = gql`
  mutation InsertFlowE2E($team1Id: Int) {
    result: insert_flows(
      objects: {
        slug: "e2e-test-flow"
        team_id: $team1Id
        name: "E2E Test Flow"
      }
    ) {
      returning {
        id
      }
    }
  }
`;

export const UPDATE_FLOW_QUERY = gql`
  mutation UpdateFlowE2E($team1FlowId: uuid!) {
    result: update_flows_by_pk(
      pk_columns: { id: $team1FlowId }
      _set: { slug: "new-slug", name: "new Name" }
    ) {
      id
    }
  }
`;

export const DELETE_FLOW_QUERY = gql`
  mutation SoftDeleteFlowE2E($team1FlowId: uuid!) {
    result: update_flows_by_pk(
      pk_columns: { id: $team1FlowId }
      _set: { deleted_at: "now()" }
    ) {
      id
    }
  }
`;
