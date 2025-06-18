import type { FlowGraph } from "@opensystemslab/planx-core/types";
import isNull from "lodash/isNull.js";

import { getTemplatedFlowEdits } from "../../../../helpers.js";
import type { Flow } from "../../../../types.js";
import type { FlowValidationResponse } from "./index.js";

const validateTemplatedNodes = async (
  flowId: string,
  flowGraph: FlowGraph,
): Promise<FlowValidationResponse> => {
  const templatedFlowEdits = await getTemplatedFlowEdits(flowId);

  if (isNull(templatedFlowEdits.templatedFrom)) {
    return {
      title: "Templated nodes",
      status: "Not applicable",
      message: "This is not a templated flow",
    };
  }

  const allRequiredTemplatedNodeIds = Object.entries(flowGraph as Flow["data"])
    .filter(
      ([_nodeId, node]) =>
        Boolean(node.data?.isTemplatedNode) &&
        Boolean(node.data?.areTemplatedNodeInstructionsRequired),
    )
    .map(([nodeId, _node]) => nodeId);
  const allEditedTemplatedNodedIds = Object.keys(
    templatedFlowEdits.edits.data || {},
  );

  // Check if allRequiredTemplatedNodesIds are contained within allEditedTemplatedNodeIds
  //   allEditedTemplatedNodeIds will also contain "optional" templated node updates, which do not impact validation checks
  const everyRequiredNodeHasBeenEdited = allRequiredTemplatedNodeIds.every(
    (requiredId) => allEditedTemplatedNodedIds.includes(requiredId),
  );
  if (!everyRequiredNodeHasBeenEdited) {
    return {
      title: "Templated nodes",
      status: "Fail",
      message: `Customise each "Required" node before publishing your templated flow`,
    };
  }

  return {
    title: "Templated nodes",
    status: "Pass",
    message: `All "Required" nodes in your templated flow have been customised`,
  };
};

export { validateTemplatedNodes };
