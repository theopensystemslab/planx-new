import classNames from "classnames";
import type { FlowNote } from "hooks/data/useFlowNotes";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";

import { useFlowNotesContext } from "./FlowNotesContext";

interface Props {
  nodeId: string;
}

export const AttachedNotes: React.FC<Props> = ({ nodeId }) => {
  const { attached, clonedContentIds } = useFlowNotesContext();
  const [showNotes, openNoteEditor] = useStore((state) => [
    state.showNotes,
    state.openNoteEditor,
  ]);
  const notes = attached.get(nodeId) ?? [];

  if (!showNotes || notes.length === 0) return null;

  return (
    <>
      {notes.map((note: FlowNote) => (
        <div
          key={note.positionId}
          className={classNames("attached-note-wrapper", {
            isClone: clonedContentIds.has(note.contentId),
          })}
        >
          <button
            type="button"
            className="attached-note"
            onClick={(event) => {
              event.stopPropagation();
              openNoteEditor({ mode: "edit", note });
            }}
          >
            {note.text || "Untitled note"}
          </button>
        </div>
      ))}
    </>
  );
};
