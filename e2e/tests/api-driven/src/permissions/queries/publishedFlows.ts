import gql from "graphql-tag";

export const INSERT_PUBLISHED_FLOW_QUERY = gql`
  mutation InsertPublishedFlowsE2E($team1FlowId: uuid!, $activeUserId: Int) {
    result: insert_published_flows(
      objects: {
        data: "{}"
        flow_id: $team1FlowId
        publisher_id: $activeUserId
      }
    ) {
      returning {
        id
      }
    }
  }
`;
