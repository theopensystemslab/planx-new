import { useMutation } from "@apollo/client";
import gql from "graphql-tag";
import type { FlowSummary } from "pages/FlowEditor/lib/store/editor";
import { FLOW_SUMMARY_FIELDS, GET_FLOWS } from "pages/Flows/queries";

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
  teamId: number;
  userId: number;
}

interface UnpinFlowVars {
  flowId: string;
  teamId: number;
}

export const usePinFlow = (variables: PinFlowVars) => {
  const { teamId } = variables;

  return useMutation<PinFlowMutation, PinFlowVars>(PIN_FLOW, {
    variables,
    refetchQueries: [{ query: GET_FLOWS, variables: { teamId } }],
  });
};

export const useUnpinFlow = (variables: UnpinFlowVars) => {
  const { teamId } = variables;

  return useMutation<UnpinFlowMutation, UnpinFlowVars>(UNPIN_FLOW, {
    variables,
    refetchQueries: [{ query: GET_FLOWS, variables: { teamId } }],
  });
};
