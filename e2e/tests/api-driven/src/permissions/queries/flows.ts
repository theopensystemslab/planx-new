import { gql } from "graphql-tag";

export const INSERT_FLOW_QUERY = gql`
  mutation InsertFlowE2E($teamId1: Int) {
    insert_flows(
      objects: {
        data: "{hello: 'world'}"
        slug: "e2e-test-flow"
        team_id: $teamId1
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
    update_flows_by_pk(pk_columns: {id: $team1FlowId}, _set: {data: "{hello: 'world2'}"}) {
      id
    }
  }
`;

export const DELETE_FLOW_QUERY = gql`
  mutation DeleteFlowE2E($team1FlowId: uuid!) {
    delete_flows_by_pk(id: $team1FlowId) {
      id
    }
  }
`;
