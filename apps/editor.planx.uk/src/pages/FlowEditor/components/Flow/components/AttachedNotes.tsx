import { Link, useParams } from "@tanstack/react-router";
import { DEFAULT_NOTE_COLOR, FlowNodeNote } from "hooks/data/useFlowNodeNotes";
import React from "react";

import { useStore } from "../../../lib/store";

const ATTACHED_PLACEMENTS = ["attached_to_node", "attached_to_option"] as const;

interface Props {
  notes: FlowNodeNote[];
  parentId: string;
}

const AttachedNotes: React.FC<Props> = ({ notes, parentId }) => {
  const { team, flow } = useParams({ from: "/_authenticated/app/$team/$flow" });
  const showNotes = useStore((state) => state.showNotes);

  const attachedNotes = notes.filter((n) =>
    (ATTACHED_PLACEMENTS as readonly string[]).includes(n.placement),
  );

  if (!showNotes || !attachedNotes.length) return null;

  return (
    <div className="attached-notes">
      {attachedNotes.map((note) => (
        <Link
          key={note.id}
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
          search={{
            type: "note",
            placement: note.placement as any,
            dbNoteId: note.id,
          }}
          preload={false}
        >
          <div
            className="attached-note"
            style={{ background: note.color ?? DEFAULT_NOTE_COLOR }}
          >
            {note.text || "Untitled note"}
          </div>
        </Link>
      ))}
    </div>
  );
};

export default AttachedNotes;
