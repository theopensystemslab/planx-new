import { getValidSchemaValues } from "@opensystemslab/planx-core";
import {
  ComponentType,
  type FlowGraph,
} from "@opensystemslab/planx-core/types";
import { hasComponentType } from "../validate/helpers.js";

/**
 * Returns true if a flow is a submission service with at least one statutory application pathway
 */
export const hasStatutoryApplicationPath = (flattenedFlow: FlowGraph): boolean => {
  const hasSendComponent = hasComponentType(flattenedFlow, ComponentType.Send);
  if (!hasSendComponent) return false;

  const statutoryApplicationTypes = getValidSchemaValues("ApplicationType");
  let foundStatutoryApplicationPath = false;

  // Lots of options besides `find` here but the goal is to break/return on first find, 
  //    not iterate over whole flow ! See https://masteringjs.io/tutorials/fundamentals/foreach-break
  Object.entries(flattenedFlow).find(([_nodeId, nodeData]: any) => {
    if (nodeData.data?.fn === "application.type") {
      // SetValue will have val property directly, Questions & Checklists will have edges
      if (nodeData.data?.val) {
        if (statutoryApplicationTypes?.includes(nodeData.data.val)) {
          foundStatutoryApplicationPath = true;
          return true;
        }
      } else if (nodeData.edges) {
        nodeData.edges.find((edgeId: string) => {
          const edgeDataValue = flattenedFlow[edgeId]?.data?.val as string;
          if (edgeDataValue && statutoryApplicationTypes?.includes(edgeDataValue)) {
            foundStatutoryApplicationPath = true;
            return true;
          }
        });
      }
    }
  });

  return foundStatutoryApplicationPath;
}
