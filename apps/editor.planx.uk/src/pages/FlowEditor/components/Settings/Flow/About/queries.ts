import gql from "graphql-tag";

export const GET_ABOUT_FLOW = gql`
  query GetAboutFlow($flowId: uuid!) {
    flow: flows_by_pk(id: $flowId) {
      id
      description
      summary
      limitations
    }
  }
`;

export const UPDATE_ABOUT_FLOW = gql`
  mutation UpdateFlow($flowId: uuid!, $flow: flows_set_input!) {
    flow: update_flows_by_pk(pk_columns: { id: $flowId }, _set: $flow) {
      id
      summary
      description
      limitations
    }
  }
`;
