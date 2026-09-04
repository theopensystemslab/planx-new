import StickyNote2Icon from "@mui/icons-material/StickyNote2";
import { useStore } from "pages/FlowEditor/lib/store";
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
      icon={<StickyNote2Icon />}
      tooltip="Toggle notes"
      ariaLabel="Toggle notes"
    />
  );
};
