import DataFieldIcon from "@mui/icons-material/Code";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import ToggleIconButton from "ui/editor/ToggleIconButton";

export const ToggleDataFieldsButton: React.FC = () => {
  const [showDataFields, toggleShowDataFields] = useStore((state) => [
    state.showDataFields,
    state.toggleShowDataFields,
  ]);

  return (
    <ToggleIconButton
      isToggled={showDataFields}
      onToggle={toggleShowDataFields}
      icon={<DataFieldIcon />}
      tooltip="Toggle data fields"
      ariaLabel="Toggle data fields"
    />
  );
};
