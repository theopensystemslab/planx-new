import {
  ComponentType,
  type FlowGraph,
  type Node,
} from "@opensystemslab/planx-core/types";
import { isComponentType } from "../helpers.js";

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

export const buildNodeTypeSet = (flowGraph: FlowGraph): Set<ComponentType> => {
  const types = new Set<ComponentType>();

  Object.values(flowGraph).forEach((node: Node) => {
    if (node?.type) types.add(node.type as ComponentType);
  });

  return types;
};

export const createFlowTypeMap = (
  flowGraph: FlowGraph,
): Map<ComponentType, Set<string>> => {
  const map = new Map<ComponentType, Set<string>>();

  Object.entries(flowGraph).forEach(
    ([nodeId, node]: [string, Node | undefined]) => {
      if (nodeId === "_root") return;
      const type = node?.type as ComponentType | undefined;
      if (!type) return;

      if (!map.has(type)) {
        map.set(type, new Set<string>());
      }
      map.get(type)!.add(nodeId);
    },
  );

  return map;
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
