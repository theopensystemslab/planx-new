import { IconNote } from "@tabler/icons-react";
import { useStore } from "pages/FlowEditor/lib/store";
import ToggleIconButton from "ui/editor/ToggleIconButton";
import { Icon } from "ui/icons/Icon";

export const ToggleNotesButton: React.FC = () => {
  const [showNotes, toggleShowNotes] = useStore((state) => [
    state.showNotes,
    state.toggleShowNotes,
  ]);

  return (
    <ToggleIconButton
      isToggled={showNotes}
      onToggle={toggleShowNotes}
      icon={<Icon icon={IconNote} />}
      tooltip="Toggle notes"
      ariaLabel="Toggle notes"
    />
  );
};
