import { Link, useParams } from "@tanstack/react-router";
import classNames from "classnames";
import { DEFAULT_NOTE_COLOR, FlowNodeNote } from "hooks/data/useFlowNodeNotes";
import React from "react";

import { useStore } from "../../../lib/store";

interface Props {
  note: FlowNodeNote;
  parentId?: string;
}

const StickyNoteCard: React.FC<Props> = ({ note, parentId }) => {
  const { team, flow } = useParams({ from: "/_authenticated/app/$team/$flow" });
  const showNotes = useStore((state) => state.showNotes);

  if (!showNotes) return null;

  return (
    <li
      className={classNames("card", "decision", "question", "isNote")}
      style={
        {
          "--note-bg-color": note.color ?? DEFAULT_NOTE_COLOR,
        } as React.CSSProperties
      }
    >
      <Link
        to={
          parentId
            ? "/app/$team/$flow/nodes/$parent/nodes/new/$before"
            : "/app/$team/$flow/nodes/new/$before"
        }
        params={{
          team,
          flow,
          before: note.nodeId,
          ...(parentId && { parent: parentId }),
        }}
        search={{ type: "note", placement: "before_node", dbNoteId: note.id }}
        preload={false}
      >
        <span>{note.text || "Untitled note"}</span>
      </Link>
    </li>
  );
};

export default StickyNoteCard;
