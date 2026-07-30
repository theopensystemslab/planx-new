import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useFlowNotesContext } from "pages/FlowEditor/components/Flow/notes/FlowNotesContext";
import { NoteEditorDialog } from "pages/FlowEditor/components/Flow/notes/NoteEditorDialog";
import React, { useMemo } from "react";

export const Route = createFileRoute(
  "/_authenticated/app/$team/$flow/_flowEditor/note/$id/edit",
)({
  component: EditNoteModal,
});

function EditNoteModal() {
  const { team, flow, id } = Route.useParams();
  const navigate = useNavigate();
  const { attached, positioned } = useFlowNotesContext();

  const note = useMemo(() => {
    for (const notes of [...attached.values(), ...positioned.values()]) {
      const found = notes.find((note) => note.id === id);
      if (found) return found;
    }
    return undefined;
  }, [attached, positioned, id]);

  const handleClose = () =>
    navigate({ to: "/app/$team/$flow", params: { team, flow } });

  if (!note) return null;

  return <NoteEditorDialog mode="edit" note={note} onClose={handleClose} />;
}
