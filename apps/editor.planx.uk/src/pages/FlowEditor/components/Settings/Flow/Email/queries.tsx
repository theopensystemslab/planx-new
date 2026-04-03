import gql from "graphql-tag";

export const GET_FLOW_EMAIL_TEMPLATE = gql`
  query GetFlowEmailTemplate($flowId: uuid!) {
    flow: flows_by_pk(id: $flowId) {
      id
      email_template
    }
  }
`;

export const UPDATE_FLOW_EMAIL_TEMPLATE = gql`
  mutation UpdateFlowEmailTemplate($flowId: uuid!, $email_template: String!) {
    update_flows_by_pk(
      pk_columns: { id: $flowId }
      _set: { email_template: $email_template }
    ) {
      id
      email_template
    }
  }
`;
