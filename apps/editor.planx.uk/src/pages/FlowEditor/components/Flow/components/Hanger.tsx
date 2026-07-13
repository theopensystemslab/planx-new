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
import { useDrop } from "react-dnd";

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

  const [{ canDrop, item }, drop] = useDrop({
    accept: ["DECISION", "PORTAL", "PAGE"],
    drop: (item: Item) => {
      moveNode(item.id, item.parent, before, parent);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
      item: monitor.isOver() && monitor.getItem(),
    }),
  });

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

  const showNoteCards = showNotes && notes.length > 0;

  return (
    <>
      {/* decoartive only - connector between parent node and note*/}
      {showNoteCards && (
        <li className="hanger note-connector" aria-hidden="true" />
      )}
      {showNoteCards &&
        notes.map((note) => <PositionedNoteCard key={note.id} note={note} />)}
      <li
        className={classnames("hanger", {
          hidden: hidden || hideHangerFromUser,
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
