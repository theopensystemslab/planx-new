import type { NodeId } from "@opensystemslab/planx-core/types";
import { useParams } from "@tanstack/react-router";
import classnames from "classnames";
import { useContextMenu } from "hooks/useContextMenu";
import { hangerAnchor } from "pages/FlowEditor/lib/hangerAnchor";
import {
  nodeIsChildOfTemplatedInternalPortal,
  nodeIsTemplatedInternalPortal,
} from "pages/FlowEditor/utils";
import React, { useCallback } from "react";
import { useDragLayer, useDrop } from "react-dnd";

import { useStore } from "../../../lib/store";
import { getParentId } from "../lib/utils";
import { useFlowNotesContext } from "../notes/FlowNotesContext";
import { placementKey } from "../notes/lib/partitionNotes";
import { PositionedNoteCard } from "../notes/PositionedNoteCard";

interface HangerProps {
  hidden?: boolean;
  parent?: NodeId;
  before?: NodeId;
}

interface Item {
  id: string;
  parent: string;
  text: string;
}

const DROPPABLE_TYPES = ["DECISION", "PORTAL", "PAGE"];

const Hanger: React.FC<HangerProps> = ({ before, parent, hidden = false }) => {
  parent = getParentId(parent);
  const { team: teamSlug, flow: flowSlug } = useParams({
    from: "/_authenticated/app/$team/$flow",
  });

  const [moveNode, isTemplatedFrom, flow, orderedFlow, showNotes] = useStore(
    (state) => [
      state.moveNode,
      state.isTemplatedFrom,
      state.flow,
      state.orderedFlow,
      state.showNotes,
    ],
  );

  const { positioned } = useFlowNotesContext();
  const notes = positioned.get(placementKey(parent, before)) ?? [];

  // When working in a templated flow, if any internal portal is marked as "isTemplatedNode", then the Hanger should be visible to add children
  const indexedParent = orderedFlow?.find(({ id }) => id === parent);
  const parentIsTemplatedInternalPortal = nodeIsTemplatedInternalPortal(
    flow,
    indexedParent,
  );
  const parentIsChildOfTemplatedInternalPortal =
    nodeIsChildOfTemplatedInternalPortal(flow, indexedParent);

  const hideHangerInTemplatedFlow = !(
    parentIsTemplatedInternalPortal || parentIsChildOfTemplatedInternalPortal
  );

  // Hiding the hanger is a proxy for disabling a 'view-only' user from adding, moving, cloning nodes
  const hideHangerFromUser = isTemplatedFrom
    ? hideHangerInTemplatedFlow
    : !useStore.getState().canUserEditTeam(teamSlug);

  const [{ isOver, canDrop, item }, drop] = useDrop({
    accept: DROPPABLE_TYPES,
    drop: (item: Item) => {
      moveNode(item.id, item.parent, before, parent);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
      item: monitor.isOver() && monitor.getItem(),
    }),
  });

  // Highlight every valid hanger as a drop target while a node is being dragged on the canvas
  const isDropTargetVisible = useDragLayer(
    (monitor) =>
      monitor.isDragging() &&
      DROPPABLE_TYPES.includes(monitor.getItemType() as string),
  );

  const handleContextMenu = useContextMenu({
    source: "hanger",
    relationships: { parent, before },
  });

  const handleHangerButtonClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      hangerAnchor.set({
        top: rect.top,
        bottom: rect.bottom,
        left: rect.left,
        right: rect.right,
      });
      useStore.getState().openComponentSelector({ parent, before });
    },
    [parent, before],
  );

  const isHidden = hidden || hideHangerFromUser;
  const showNoteCards = showNotes && notes.length > 0;

  return (
    <>
      {showNoteCards && (
        /* decoartive only - connector between parent node and note*/
        <li className="hanger note-connector" aria-hidden="true" />
      )}
      {showNoteCards &&
        notes.map((note) => <PositionedNoteCard key={note.id} note={note} />)}
      <li
        className={classnames("hanger", {
          hidden: isHidden,
          "hanger--drop-target": isDropTargetVisible && !isHidden,
          "hanger--drop-target-active":
            isDropTargetVisible && !isHidden && isOver && canDrop,
        })}
        ref={(el) => {
          drop(el);
        }}
      >
        <button
          onContextMenu={handleContextMenu}
          onClick={handleHangerButtonClick}
        >
          {canDrop && item && item.text}
        </button>
      </li>
    </>
  );
};

export default Hanger;
