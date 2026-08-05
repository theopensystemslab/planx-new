import type { Store } from "..";

const TEMPLATED_NODE_PROPS = [
  "isTemplatedNode",
  "templatedNodeInstructions",
  "areTemplatedNodeInstructionsRequired",
] as const;

/**
 * Strip template-authoring props from a node's data
 *
 * Used when pasting a node copied from a source template into a flow that isn't
 * itself a source template - those props only make sense there, so left behind
 * they'd falsely mark an ordinary node as templated
 */
export const stripTemplatedNodeProps = (node: Store.Node): Store.Node => {
  if (!node.data) return node;

  const data = { ...node.data };
  TEMPLATED_NODE_PROPS.forEach((prop) => delete data[prop]);

  return { ...node, data };
};
