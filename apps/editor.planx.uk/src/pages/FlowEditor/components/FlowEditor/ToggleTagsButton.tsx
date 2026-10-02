import { IconTagFilled } from "@tabler/icons-react";
import { useStore } from "pages/FlowEditor/lib/store";
import ToggleIconButton from "ui/editor/ToggleIconButton";
import { Icon } from "ui/icons/Icon";

export const ToggleTagsButton: React.FC = () => {
  const [showTags, toggleShowTags] = useStore((state) => [
    state.showTags,
    state.toggleShowTags,
  ]);

  return (
    <ToggleIconButton
      isToggled={showTags}
      onToggle={toggleShowTags}
      icon={<Icon icon={IconTagFilled} />}
      tooltip="Toggle tags"
      ariaLabel="Toggle tags"
    />
  );
};
