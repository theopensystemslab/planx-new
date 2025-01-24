import type { ComponentType, FlowGraph, Node } from "@opensystemslab/planx-core/types";
import type { Entry } from "type-fest";


export const isComponentType = (
  entry: Entry<FlowGraph>,
  type: ComponentType,
): entry is [string, Node] => {
  const [nodeId, node] = entry;
  if (nodeId === "_root") return false;
  return Boolean(node?.type === type);
};