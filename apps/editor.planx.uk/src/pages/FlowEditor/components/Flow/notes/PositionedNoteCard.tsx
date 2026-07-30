import { useNavigate, useParams } from "@tanstack/react-router";
import type { FlowNote } from "hooks/data/useFlowNotes";
import React from "react";

interface Props {
  note: FlowNote;
}

export const PositionedNoteCard: React.FC<Props> = ({ note }) => {
  const navigate = useNavigate();
  const { team, flow } = useParams({ from: "/_authenticated/app/$team/$flow" });

  return (
    <li className="note-card">
      <button
        type="button"
        onClick={() =>
          navigate({
            to: "/app/$team/$flow/note/$id/edit",
            params: { team, flow, id: note.id },
          })
        }
      >
        <span className="note-text">{note.text || "Untitled note"}</span>
      </button>
    </li>
  );
};
