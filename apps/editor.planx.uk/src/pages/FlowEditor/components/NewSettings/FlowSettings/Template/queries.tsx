import gql from "graphql-tag";

export const GET_FLOW_TEMPLATE_STATUS = gql`
  query GetFlowTemplateStatus($flowId: uuid!) {
    flow: flows_by_pk(id: $flowId) {
      id
      templatedFrom: templated_from
      template {
        team {
          name
        }
      }
    }
  }
`;

export const EJECT_FLOW_FROM_TEMPLATE = gql`
  mutation EjectFlowFromTemplate($flowId: uuid!) {
    update_flows_by_pk(
      pk_columns: { id: $flowId }
      _set: { templated_from: null }
    ) {
      id
    }
  }
`;
