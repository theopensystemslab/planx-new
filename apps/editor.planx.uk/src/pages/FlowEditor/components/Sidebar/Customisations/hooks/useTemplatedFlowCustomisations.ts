import { gql, useSubscription } from "@apollo/client";
import { useStore } from "pages/FlowEditor/lib/store";
import { selectOrderedFlow } from "pages/FlowEditor/lib/store/selectors";

import { getEditedFolderIds, hasNodeBeenUpdated } from "../helpers";
import type { FlowEdits } from "../types";

const GET_TEMPLATED_FLOW_EDITS = gql`
  subscription GetTemplatedFlowEdits($flow_id: uuid = "") {
    edits: templated_flow_edits(where: { flow_id: { _eq: $flow_id } }) {
      data
    }
  }
`;

interface QueryResult {
  edits: { data: FlowEdits }[];
}

/**
 * Subscribe to the edits made to a templated flow, and count how many required customisations are complete
 */
export const useTemplatedFlowCustomisations = () => {
  const [flowId, isTemplatedFrom, flow] = useStore((state) => [
    state.id,
    state.isTemplatedFrom,
    state.flow,
  ]);
  const orderedFlow = useStore(selectOrderedFlow);

  const { data, loading, error } = useSubscription<QueryResult>(
    GET_TEMPLATED_FLOW_EDITS,
    {
      variables: { flow_id: flowId },
      skip: !isTemplatedFrom,
    },
  );

  const flowEdits: FlowEdits = data?.edits?.[0]?.data || {};
  const editedFolderIds = getEditedFolderIds(flowEdits, orderedFlow);

  // Only templated flows have customisations to complete
  // Source templates also contain required nodes, but have nothing to customise
  const requiredNodeIds = (isTemplatedFrom ? orderedFlow : [])
    .filter(
      (node) =>
        node.data?.isTemplatedNode &&
        node.data?.areTemplatedNodeInstructionsRequired === true,
    )
    .map((node) => node.id);

  const required = requiredNodeIds.length;
  const completed = requiredNodeIds.filter((nodeId) =>
    hasNodeBeenUpdated(nodeId, flow, flowEdits, editedFolderIds),
  ).length;
  const outstanding = required - completed;

  return {
    flowEdits,
    editedFolderIds,
    required,
    completed,
    outstanding,
    loading,
    error,
  };
};
