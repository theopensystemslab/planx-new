import { notFound } from "@tanstack/react-router";
import { SLUGS } from "pages/FlowEditor/data/types";
import { useStore } from "pages/FlowEditor/lib/store";
import { calculateExtraProps } from "utils/routeUtils/queryUtils";

import type { NodeSearchParams } from "./route";

/**
 * Reads the node (and its options) from the live state of the graph in the store
 *
 * @warning Routes using this loader to edit the graph must set `gcTime: 0`
 * Using cached data here means that forms in the Editor modal are seeded with stale data on mount
 */
export async function loader({
  team,
  flow,
  id,
  parent,
  before,
  type,
  isEdit,
  includeHandleDelete,
}: {
  team: string;
  flow: string;
  id?: string;
  parent?: string;
  before?: string;
  type?: NodeSearchParams["type"];
  isEdit?: boolean;
  includeHandleDelete: boolean;
}) {
  const node = id ? useStore.getState().getNode(id) : undefined;

  if (id && !node) {
    throw notFound();
  }

  const nodeType = node?.type ? SLUGS[node.type] : undefined;
  const actualType = (type || nodeType || "question") as NonNullable<
    NodeSearchParams["type"]
  >;

  const extraProps = await calculateExtraProps(actualType, team, flow, {
    nodeId: id,
    node,
    isEdit,
  });

  const handleDelete = includeHandleDelete
    ? () => {
        if (id && parent) {
          useStore.getState().removeNode(id, parent);
        } else {
          console.error("Cannot delete node: ID or parent is undefined");
        }
      }
    : undefined;

  return {
    type: actualType,
    extraProps,
    node,
    id,
    parent,
    before,
    handleDelete,
  };
}
