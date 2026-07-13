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
        style={{ background: note.color }}
        onClick={() => openNoteEditor({ mode: "edit", note })}
      >
        {note.text || "Untitled note"}
      </button>
    </li>
  );
};
