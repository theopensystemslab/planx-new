import { IconHelpCircleFilled } from "@tabler/icons-react";
import { useStore } from "pages/FlowEditor/lib/store";
import ToggleIconButton from "ui/editor/ToggleIconButton";
import { Icon } from "ui/icons/Icon";

export const ToggleHelpTextButton: React.FC = () => {
  const [showHelpText, toggleShowHelpText] = useStore((state) => [
    state.showHelpText,
    state.toggleShowHelpText,
  ]);

  return (
    <ToggleIconButton
      isToggled={showHelpText}
      onToggle={toggleShowHelpText}
      icon={<Icon icon={IconHelpCircleFilled} />}
      tooltip="Toggle help text"
      ariaLabel="Toggle help text"
    />
  );
};
