import NoteIcon from "@mui/icons-material/Note";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import ToggleIconButton from "ui/editor/ToggleIconButton";

export const ToggleNotesButton: React.FC = () => {
  const [showNotes, toggleShowNotes] = useStore((state) => [
    state.showNotes,
    state.toggleShowNotes,
  ]);

  return (
    <ToggleIconButton
      isToggled={showNotes}
      onToggle={toggleShowNotes}
      icon={<NoteIcon />}
      tooltip="Toggle notes"
      ariaLabel="Toggle notes"
    />
  );
};
