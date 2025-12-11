import { gql } from "@apollo/client";

export const GET_FLOW_VISIBILITY = gql`
  query GetFlowVisibility($flowId: uuid!) {
    flows(where: { id: { _eq: $flowId } }, limit: 1) {
      id
      canCreateFromCopy: can_create_from_copy
    }
  }
`;

export const UPDATE_FLOW_VISIBILITY = gql`
  mutation UpdateFlowVisibility($flowId: uuid!, $canCreateFromCopy: Boolean!) {
    update_flows_by_pk(
      pk_columns: { id: $flowId }
      _set: { can_create_from_copy: $canCreateFromCopy }
    ) {
      id
      canCreateFromCopy: can_create_from_copy
    }
  }
`;
