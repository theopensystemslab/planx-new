import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import { notFound } from "@tanstack/react-router";
import { SLUGS } from "pages/FlowEditor/data/types";
import { useStore } from "pages/FlowEditor/lib/store";
import { calculateExtraProps } from "utils/routeUtils/queryUtils";

import { NodeSearchParams } from "./route";

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

  let nodeType = node?.type ? SLUGS[node.type] : undefined;

  // A Question with no child nodes is a sticky note — open it with the note editor
  if (id && node?.type === TYPES.Question && !type) {
    const flowData = useStore.getState().flow;
    const edges = flowData[id]?.edges ?? [];
    if (edges.length === 0) nodeType = "note";
  }

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
