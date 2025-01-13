import LabelIcon from "@mui/icons-material/Label";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import ToggleIconButton from "ui/editor/ToggleIconButton";

export const ToggleTagsButton: React.FC = () => {
  const [showTags, toggleShowTags] = useStore((state) => [
    state.showTags,
    state.toggleShowTags,
  ]);

  return (
    <ToggleIconButton
      isToggled={showTags}
      onToggle={toggleShowTags}
      icon={<LabelIcon />}
      tooltip="Toggle tags"
      ariaLabel="Toggle tags"
    />
  );
};
