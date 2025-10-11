import HelpTextIcon from "@mui/icons-material/Help";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import ToggleIconButton from "ui/editor/ToggleIconButton";

export const ToggleHelpTextButton: React.FC = () => {
  const [showHelpText, toggleShowHelpText] = useStore((state) => [
    state.showHelpText,
    state.toggleShowHelpText,
  ]);

  return (
    <ToggleIconButton
      isToggled={showHelpText}
      onToggle={toggleShowHelpText}
      icon={<HelpTextIcon />}
      tooltip="Toggle help text"
      ariaLabel="Toggle help text"
    />
  );
};
