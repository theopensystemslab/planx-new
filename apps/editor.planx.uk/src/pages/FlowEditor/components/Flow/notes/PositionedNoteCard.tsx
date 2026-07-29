import classNames from "classnames";
import type { FlowNote } from "hooks/data/useFlowNotes";
import { useContextMenu } from "hooks/useContextMenu";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";

interface Props {
  note: FlowNote;
  /** True when this note's content is shared with another note elsewhere in the flow (i.e. it's a clone) */
  isClone?: boolean;
}

export const PositionedNoteCard: React.FC<Props> = ({
  note,
  isClone = false,
}) => {
  const openNoteEditor = useStore((state) => state.openNoteEditor);

  const handleContextMenu = useContextMenu({
    source: "positioned-note",
    relationships: { self: note.positionId, contentId: note.contentId },
  });

  return (
    <li className={classNames("note-card", { isClone })}>
      <button
        type="button"
        onContextMenu={handleContextMenu}
        onClick={() => openNoteEditor({ mode: "edit", note })}
      >
        {note.text || "Untitled note"}
      </button>
    </li>
  );
};
