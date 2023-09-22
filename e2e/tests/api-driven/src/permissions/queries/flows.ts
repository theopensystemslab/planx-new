import { gql } from "graphql-tag";

export const INSERT_FLOW_QUERY = gql`
  mutation InsertFlowE2E($team1Id: Int) {
    result: insert_flows(
      objects: {
        data: "{hello: 'world'}"
        slug: "e2e-test-flow"
        team_id: $team1Id
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
      _set: { data: "{hello: 'world2'}" }
    ) {
      id
    }
  }
`;

export const DELETE_FLOW_QUERY = gql`
  mutation DeleteFlowE2E($team1FlowId: uuid!) {
    result: delete_flows_by_pk(id: $team1FlowId) {
      id
    }
  }
`;
