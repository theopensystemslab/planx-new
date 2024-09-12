import type {
  ComponentType,
  FlowGraph,
  Node,
} from "@opensystemslab/planx-core/types";
import type { Entry } from "type-fest";

export const isComponentType = (
  entry: Entry<FlowGraph>,
  type: ComponentType,
): entry is [string, Node] => {
  const [nodeId, node] = entry;
  if (nodeId === "_root") return false;
  return Boolean(node?.type === type);
};

export const hasComponentType = (
  flowGraph: FlowGraph,
  type: ComponentType,
  fn?: string,
): boolean => {
  const nodeIds = Object.entries(flowGraph).filter(
    (entry): entry is [string, Node] => isComponentType(entry, type),
  );
  if (fn) {
    nodeIds
      ?.filter(([_nodeId, nodeData]) => nodeData?.data?.fn === fn)
      ?.map(([nodeId, _nodeData]) => nodeId);
  } else {
    nodeIds?.map(([nodeId, _nodeData]) => nodeId);
  }
  return Boolean(nodeIds?.length);
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
    nodeIds
      ?.filter(([_nodeId, nodeData]) => nodeData?.data?.fn === fn)
      ?.map(([nodeId, _nodeData]) => nodeId);
  } else {
    nodeIds?.map(([nodeId, _nodeData]) => nodeId);
  }
  return nodeIds?.length;
};
