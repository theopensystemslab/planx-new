import type { Node, NodeId } from "@opensystemslab/planx-core/types";
import type * as jsondiffpatch from "jsondiffpatch";
import isEmpty from "lodash/isEmpty.js";
import type { Flow } from "../../../../types.js";

export const transformDeltaToTemplatedFlowEditsData = (
  delta: jsondiffpatch.Delta,
  data: Flow["data"],
): Record<NodeId, Partial<Node>> => {
  const templatedFlowEditsData: Record<NodeId, Partial<Node>> = {};

  // For each changed node property in the delta, extract its' current data state only
  //   to store in templated_flow_edits (delta returns before and after state)
  Object.entries(delta).forEach(([nodeId, nodeData]) => {
    const updatedNodeData: Node["data"] = {};
    const updatedKeys: string[] = nodeData?.data && Object.keys(nodeData.data);
    updatedKeys?.forEach((updatedKey) => {
      // TODO double-check how this handles removing properties eg 'description'
      updatedNodeData[updatedKey] = data[nodeId]?.["data"]?.[updatedKey];
    });

    const updatedEdges = nodeData?.edges;

    templatedFlowEditsData[nodeId] = {
      ...(Object.keys(updatedNodeData).length > 0 && { data: updatedNodeData }),
      ...(updatedEdges && { edges: data[nodeId]?.["edges"] }),
    };

    // If it's an entirely new node (Option type) that has been added, it won't
    //   have changed data & edges (eg `"nodeId": {}`) so instead need to capture whole node data
    Object.keys(templatedFlowEditsData).forEach((nodeId) => {
      if (isEmpty(templatedFlowEditsData[nodeId])) {
        templatedFlowEditsData[nodeId] = data[nodeId];
      }
    });
  });

  return templatedFlowEditsData;
};
