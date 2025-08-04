import {
  ComponentType,
  type FlowGraph,
} from "@opensystemslab/planx-core/types";
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
    templatedFlowEdits.edits?.data || {},
  );

  // For each required templated node, check if itself or its' children have been edited
  //   Keep this logic in sync with customisation card `hasNodeBeenUpdated` in the frontend !
  const haveAllRequiredTemplatedNodesBeenEdited =
    allRequiredTemplatedNodeIds.every((nodeId) => {
      // The required node has been directly edited
      if (allEditedTemplatedNodedIds.includes(nodeId)) return true;

      const node = flowGraph[nodeId];
      const isNodeWithChildren =
        node.type &&
        [
          ComponentType.Question,
          ComponentType.Checklist,
          ComponentType.ResponsiveQuestion,
          ComponentType.ResponsiveChecklist,
          ComponentType.InternalPortal,
        ].includes(node.type);

      // The "children" of the required node have been updated
      if (isNodeWithChildren) {
        const isChildEdited = node.edges?.some((edgeId) =>
          allEditedTemplatedNodedIds.includes(edgeId),
        );
        return isChildEdited;
      }

      // Required node has not been edited
      return false;
    });

  if (!haveAllRequiredTemplatedNodesBeenEdited) {
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
