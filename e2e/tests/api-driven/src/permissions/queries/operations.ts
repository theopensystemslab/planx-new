import { gql } from "graphql-tag";

export const INSERT_OPERATION_QUERY = gql`
  mutation InsertOperationE2E($team1FlowId: uuid!) {
    result: insert_operations_one(object: {
      data: "{}", 
      flow_id: $team1FlowId, 
    }) {
      id
    }
  }
`;

export const UPDATE_OPERATION_QUERY = gql`
  mutation UpdateOperationE2E($team1FlowId: uuid!) {
    result: update_operations(where: {flow_id: {_eq: $team1FlowId}}, _set: {data: ""}) {
      returning {
        id
      }
    }
  }
`;