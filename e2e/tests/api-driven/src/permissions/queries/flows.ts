import { gql } from "graphql-request";

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
