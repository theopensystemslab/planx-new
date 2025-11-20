import gql from "graphql-tag";

export const GET_FLOW_TEMPLATE_STATUS = gql`
  query GetFlowTemplateStatus($flowId: uuid!) {
    flow: flows_by_pk(id: $flowId) {
      id
      name
      templatedFrom: templated_from
      team {
        id
        name
      }
      template {
        id
        name
        team {
          id
          name
        }
      }
    }
  }
`;

export const EJECT_FLOW_FROM_TEMPLATE = gql`
  mutation EjectFlowFromTemplate($flowId: uuid!, $copiedFrom: uuid!) {
    update_flows_by_pk(
      pk_columns: { id: $flowId }
      # Keep a record of the original template, but now as copied_from source
      _set: { templated_from: null, copied_from: $copiedFrom }
    ) {
      id
      copied_from
      templated_from
    }
  }
`;
