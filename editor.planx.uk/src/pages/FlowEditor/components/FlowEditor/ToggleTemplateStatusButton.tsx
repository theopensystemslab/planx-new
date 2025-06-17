import StarIcon from "@mui/icons-material/Star";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import ToggleIconButton from "ui/editor/ToggleIconButton";

export const ToggleTemplateStatusButton: React.FC = () => {
  const [showTemplateStatus, toggleShowTemplateStatus] = useStore((state) => [
    state.showTemplateStatus,
    state.toggleShowTemplateStatus,
  ]);

  return (
    <ToggleIconButton
      isToggled={showTemplateStatus}
      onToggle={toggleShowTemplateStatus}
      icon={<StarIcon />}
      tooltip="Toggle template status"
      ariaLabel="Toggle template status"
    />
  );
};
