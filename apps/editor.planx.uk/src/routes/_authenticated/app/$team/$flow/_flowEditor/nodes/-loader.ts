import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import { notFound } from "@tanstack/react-router";
import {
  GET_FLOW_NODE_NOTE_BY_ID,
  NotePlacement,
} from "hooks/data/useFlowNodeNotes";
import { client } from "lib/graphql";
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
  placement,
  dbNoteId,
  isEdit,
  includeHandleDelete,
}: {
  team: string;
  flow: string;
  id?: string;
  parent?: string;
  before?: string;
  type?: NodeSearchParams["type"];
  placement?: NodeSearchParams["placement"];
  dbNoteId?: string;
  isEdit?: boolean;
  includeHandleDelete: boolean;
}) {
  // Editing an existing DB note — fetch it and return early
  if (dbNoteId) {
    const { data } = await client.query({
      query: GET_FLOW_NODE_NOTE_BY_ID,
      variables: { id: dbNoteId },
      fetchPolicy: "no-cache",
    });

    const note = data?.flow_node_notes_by_pk;
    if (!note) throw notFound();

    return {
      type: "note" as NonNullable<NodeSearchParams["type"]>,
      extraProps: {
        dbNoteId,
        noteNodeId: note.nodeId,
        existingNote: {
          text: note.text,
          color: note.color,
          placement: note.placement as NotePlacement,
        },
      },
      node: undefined,
      id: undefined,
      parent: undefined,
      before: undefined,
      handleDelete: undefined,
    };
  }

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

  if (actualType === "note") {
    // nodeId for the DB: option-attached notes use the parent (option node), all others use before
    const noteNodeId = placement === "attached_to_option" ? parent : before;

    extraProps.placement = placement ?? "before_node";
    extraProps.noteNodeId = noteNodeId;
  }

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
