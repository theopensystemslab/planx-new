import { IconPhotoFilled } from "@tabler/icons-react";
import { useStore } from "pages/FlowEditor/lib/store";
import ToggleIconButton from "ui/editor/ToggleIconButton";
import { Icon } from "ui/icons/Icon";

export const ToggleImagesButton: React.FC = () => {
  const [showImages, toggleShowImages] = useStore((state) => [
    state.showImages,
    state.toggleShowImages,
  ]);

  return (
    <ToggleIconButton
      isToggled={showImages}
      onToggle={toggleShowImages}
      icon={<Icon icon={IconPhotoFilled} />}
      tooltip="Toggle images"
      ariaLabel="Toggle images"
    />
  );
};
