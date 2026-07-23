import type { FlowNote } from "hooks/data/useFlowNotes";
import React from "react";

interface Props {
  note: FlowNote;
}

export const PositionedNoteCard: React.FC<Props> = ({ note }) => {
  return (
    <li className="note-card">
      <button type="button">{note.text || "Untitled note"}</button>
    </li>
  );
};
