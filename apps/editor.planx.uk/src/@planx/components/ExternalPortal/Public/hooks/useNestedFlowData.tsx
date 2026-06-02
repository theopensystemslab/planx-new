import { gql, useQuery } from "@apollo/client";
import { FlowGraph } from "@opensystemslab/planx-core/types";

const FETCH_NESTED_FLOW_DATA = gql`
  query FetchNestedFlowData($flowId: uuid!) {
    nestedFlow: flows_by_pk(id: $flowId) {
      data
    }
  }
`;

export interface NestedFlowQueryResult {
  nestedFlow: {
    data: FlowGraph;
  };
}

export const useNestedFlowData = (flowId: string): FlowGraph | undefined => {
  const { data } = useQuery<NestedFlowQueryResult>(FETCH_NESTED_FLOW_DATA, {
    context: { role: "public" },
    variables: { flowId },
  });

  return data?.nestedFlow?.data;
};
