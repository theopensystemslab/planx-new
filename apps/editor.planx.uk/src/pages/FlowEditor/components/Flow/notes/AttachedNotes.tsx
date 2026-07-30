import { useNavigate, useParams } from "@tanstack/react-router";
import type { FlowNote } from "hooks/data/useFlowNotes";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";

import { useFlowNotesContext } from "./FlowNotesContext";

interface Props {
  nodeId: string;
}

export const AttachedNotes: React.FC<Props> = ({ nodeId }) => {
  const { attached } = useFlowNotesContext();
  const showNotes = useStore((state) => state.showNotes);
  const navigate = useNavigate();
  const { team, flow } = useParams({ from: "/_authenticated/app/$team/$flow" });
  const notes = attached.get(nodeId) ?? [];

  if (!showNotes || notes.length === 0) return null;

  return (
    <>
      {notes.map((note: FlowNote) => (
        <button
          key={note.id}
          type="button"
          className="attached-note"
          onClick={(event) => {
            event.stopPropagation();
            navigate({
              to: "/app/$team/$flow/note/$id/edit",
              params: { team, flow, id: note.id },
            });
          }}
        >
          <span className="note-text">{note.text || "Untitled note"}</span>
        </button>
      ))}
    </>
  );
};
