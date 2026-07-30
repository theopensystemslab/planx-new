import type { FlowNote } from "hooks/data/useFlowNotes";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";

interface Props {
  note: FlowNote;
}

export const PositionedNoteCard: React.FC<Props> = ({ note }) => {
  const openNoteEditor = useStore((state) => state.openNoteEditor);

  return (
    <li className="note-card">
      <button
        type="button"
        onClick={() => openNoteEditor({ mode: "edit", note })}
      >
        <span className="note-text">{note.text || "Untitled note"}</span>
      </button>
    </li>
  );
};
