import { useNavigate, useParams } from "@tanstack/react-router";
import classNames from "classnames";
import type { FlowNote } from "hooks/data/useFlowNotes";
import { useContextMenu } from "hooks/useContextMenu";
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
  const navigate = useNavigate();
  const { team, flow } = useParams({ from: "/_authenticated/app/$team/$flow" });

  const handleContextMenu = useContextMenu({
    source: "positioned-note",
    relationships: { self: note.positionId, contentId: note.contentId },
  });

  return (
    <li className={classNames("note-card", { isClone })}>
      <button
        type="button"
        onContextMenu={handleContextMenu}
        onClick={() =>
          navigate({
            to: "/app/$team/$flow/note/$id/edit",
            params: { team, flow, id: note.positionId },
          })
        }
      >
        <span className="note-text">{note.text || "Untitled note"}</span>
      </button>
    </li>
  );
};
