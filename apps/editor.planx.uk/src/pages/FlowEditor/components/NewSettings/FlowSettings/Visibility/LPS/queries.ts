import { gql } from "@apollo/client";

export const GET_LPS_LISTING = gql`
  query GetLPSListing($flowId: uuid!) {
    flows(where: { id: { _eq: $flowId } }, limit: 1) {
      id
      isListedOnLPS: is_listed_on_lps
      summary
    }
  }
`;

export const UPDATE_LPS_LISTING = gql`
  mutation UpdateLPSListing($flowId: uuid!, $isListedOnLPS: Boolean!) {
    update_flows_by_pk(
      pk_columns: { id: $flowId }
      _set: { is_listed_on_lps: $isListedOnLPS }
    ) {
      id
      isListedOnLPS: is_listed_on_lps
    }
  }
`;
