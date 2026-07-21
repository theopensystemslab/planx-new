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
  const notes = attached.get(nodeId) ?? [];

  if (!showNotes || notes.length === 0) return null;

  return (
    <>
      {notes.map((note: FlowNote) => (
        <button key={note.id} type="button" className="attached-note">
          {note.text || "Untitled note"}
        </button>
      ))}
    </>
  );
};
