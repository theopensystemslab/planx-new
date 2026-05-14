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
  mutation UpdateFlowEmailTemplate(
    $flowId: uuid!
    $emailTemplate: gov_notify_email_template_enum_enum!
  ) {
    flow: update_flows_by_pk(
      pk_columns: { id: $flowId }
      _set: { email_template: $emailTemplate }
    ) {
      id
      email_template
    }
  }
`;
