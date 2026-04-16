import { useMutation } from "@apollo/client";
import gql from "graphql-tag";
import { FlowSummary } from "pages/FlowEditor/lib/store/editor";
import { GET_FLOWS } from "pages/Team/queries";

// this is copied from the getFlows query in FlowEditor/lib/store/editor.ts - might be worth re-using the fragment there as well?
export const FLOW_SUMMARY_FIELDS = gql`
  fragment FlowSummaryFields on flows {
    id
    name
    slug
    status
    summary
    updatedAt: updated_at
    isListedOnLPS: is_listed_on_lps
    operations(limit: 1, order_by: { created_at: desc }) {
      createdAt: created_at
      actor {
        firstName: first_name
        lastName: last_name
      }
    }
    templatedFrom: templated_from
    isTemplate: is_template
    template {
      team {
        id
        name
      }
    }
    publishedFlows: published_flows(order_by: { created_at: desc }, limit: 1) {
      publishedAt: created_at
      hasSendComponent: has_send_component
      hasVisiblePayComponent: has_pay_component
      hasEnabledServiceCharge: service_charge_enabled
    }
    pinnedFlows: user_pinned_flows {
      flowId: flow_id
    }
  }
`;

export const PIN_FLOW = gql`
  ${FLOW_SUMMARY_FIELDS}
  mutation PinFlow($flowId: uuid!, $userId: Int!) {
    insert_user_pinned_flows_one(
      object: { flow_id: $flowId, user_id: $userId }
    ) {
      flow {
        ...FlowSummaryFields
      }
    }
  }
`;

// userId not required as a variable, as it is pulled from the jwt by the hasura middleware, and used to restrict operations
export const UNPIN_FLOW = gql`
  ${FLOW_SUMMARY_FIELDS}
  mutation UnpinFlow($flowId: uuid!) {
    delete_user_pinned_flows(where: { flow_id: { _eq: $flowId } }) {
      returning {
        flow {
          ...FlowSummaryFields
        }
      }
    }
  }
`;

interface PinFlowMutation {
  insert_user_pinned_flows_one: { flow: FlowSummary };
}

interface UnpinFlowMutation {
  delete_user_pinned_flows: { returning: { flow: FlowSummary }[] };
}

interface PinFlowVars {
  flowId: string;
  userId: number;
  teamId: number;
}

interface UnpinFlowVars {
  flowId: string;
  userId: number; // TODO un-duplicate types
  teamId: number;
}

export const usePinFlow = (variables: PinFlowVars) => {
  const { teamId, userId } = variables;

  return useMutation<PinFlowMutation, PinFlowVars>(PIN_FLOW, {
    variables,
    refetchQueries: [{ query: GET_FLOWS, variables: { teamId, userId } }],
  })
};

export const useUnpinFlow = (variables: UnpinFlowVars) => {
  const { teamId, userId } = variables;

  return useMutation<UnpinFlowMutation, UnpinFlowVars>(UNPIN_FLOW, {
    variables,
    refetchQueries: [{ query: GET_FLOWS, variables: { teamId, userId } }],
  })};
