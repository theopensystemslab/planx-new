import {
  ComponentType,
  type FlowGraph,
  type Node,
} from "@opensystemslab/planx-core/types";
import { isComponentType } from "../flowHelpers.js";

export const hasComponentType = (
  flowGraph: FlowGraph,
  type: ComponentType,
  fn?: string,
): boolean => {
  const nodeIds = Object.entries(flowGraph).filter(
    (entry): entry is [string, Node] => isComponentType(entry, type),
  );

  if (fn) {
    if (type === ComponentType.Answer) {
      return nodeIds.some(([, nodeData]) => nodeData?.data?.val === fn);
    } else {
      return nodeIds.some(([, nodeData]) => nodeData?.data?.fn === fn);
    }
  }

  return Boolean(nodeIds.length);
};

export const numberOfComponentType = (
  flowGraph: FlowGraph,
  type: ComponentType,
  fn?: string,
): number => {
  const nodeIds = Object.entries(flowGraph).filter(
    (entry): entry is [string, Node] => isComponentType(entry, type),
  );
  if (fn) {
    if (type === ComponentType.Answer) {
      return nodeIds
        ?.filter(([_nodeId, nodeData]) => nodeData?.data?.val === fn)
        ?.map(([nodeId, _nodeData]) => nodeId)?.length;
    } else {
      return nodeIds
        ?.filter(([_nodeId, nodeData]) => nodeData?.data?.fn === fn)
        ?.map(([nodeId, _nodeData]) => nodeId)?.length;
    }
  } else {
    return nodeIds?.map(([nodeId, _nodeData]) => nodeId)?.length;
  }
};
