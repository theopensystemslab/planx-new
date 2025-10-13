import ImageIcon from "@mui/icons-material/Image";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import ToggleIconButton from "ui/editor/ToggleIconButton";

export const ToggleImagesButton: React.FC = () => {
  const [showImages, toggleShowImages] = useStore((state) => [
    state.showImages,
    state.toggleShowImages,
  ]);

  return (
    <ToggleIconButton
      isToggled={showImages}
      onToggle={toggleShowImages}
      icon={<ImageIcon />}
      tooltip="Toggle images"
      ariaLabel="Toggle images"
    />
  );
};
