import {
  ComponentType,
  type FlowGraph,
} from "@opensystemslab/planx-core/types";
import { hasComponentType } from "../validate/helpers.js";
import { getValidSchemaValues } from "@opensystemslab/planx-core";

export const hasStatutoryApplicationType = (flattenedFlow: FlowGraph) => {
  const hasSendComponent = hasComponentType(flattenedFlow, ComponentType.Send);
  if (!hasSendComponent) return false;

  const statutoryApplicationTypes = getValidSchemaValues("ApplicationType");
  if (!statutoryApplicationTypes) return false;

  let isStatutoryApplication = false;
  Object.entries(flattenedFlow).some(([nodeId, _nodeData]) => {
    const nodeToCheck = flattenedFlow[nodeId];

    // Only continue if application.type exists in a Node
    if (nodeToCheck?.data?.fn === "application.type") {
      // Check SetValue as data.val will be in node, not edge
      if (typeof nodeToCheck.data?.val === "string") {
        isStatutoryApplication = statutoryApplicationTypes.includes(
          nodeToCheck.data?.val,
        );
        return isStatutoryApplication;
      }

      // Check other Nodes which have Edges
      if (nodeToCheck.edges) {
        // Loop through each edge and check the value
        nodeToCheck.edges.some((edge) => {
          const edgeData = flattenedFlow[edge]?.data;
          if (typeof edgeData?.val === "string") {
            isStatutoryApplication = statutoryApplicationTypes.includes(
              edgeData.val,
            );
            return isStatutoryApplication;
          }
        });
      }
    }
  });
  return isStatutoryApplication;
};
