import { gql } from "@apollo/client";

export const GET_LPS_LISTING = gql`
  query GetLPSListing($flowId: uuid!) {
    flow: flows_by_pk(id: $flowId) {
      id
      isListedOnLPS: is_listed_on_lps
      category
      summary
    }
  }
`;

export const UPDATE_LPS_LISTING = gql`
  mutation UpdateLPSListing(
    $flowId: uuid!
    $isListedOnLPS: Boolean!
    $category: String!
  ) {
    update_flows_by_pk(
      pk_columns: { id: $flowId }
      _set: { is_listed_on_lps: $isListedOnLPS, category: $category }
    ) {
      id
      isListedOnLPS: is_listed_on_lps
      category
    }
  }
`;
