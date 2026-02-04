import { notFound } from "@tanstack/react-router";
import { SLUGS } from "pages/FlowEditor/data/types";
import { useStore } from "pages/FlowEditor/lib/store";
import { calculateExtraProps } from "utils/routeUtils/queryUtils";

import { NodeSearchParams } from "./route";

export async function sharedNodeLoader({
  team,
  flow,
  id,
  parent,
  before,
  type,
  isEdit,
  includeExtraProps,
  includeHandleDelete,
}: {
  team: string;
  flow: string;
  id?: string;
  parent?: string;
  before?: string;
  type?: NodeSearchParams["type"];
  isEdit?: boolean;
  includeExtraProps?: boolean;
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

  const extraProps = includeExtraProps
    ? await calculateExtraProps(actualType, team, flow, {
        nodeId: id,
        node,
        isEdit,
      })
    : undefined;

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
