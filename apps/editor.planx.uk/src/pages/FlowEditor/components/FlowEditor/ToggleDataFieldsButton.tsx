import { IconCode } from "@tabler/icons-react";
import { useStore } from "pages/FlowEditor/lib/store";
import ToggleIconButton from "ui/editor/ToggleIconButton";
import { Icon } from "ui/icons/Icon";

export const ToggleDataFieldsButton: React.FC = () => {
  const [showDataFields, toggleShowDataFields] = useStore((state) => [
    state.showDataFields,
    state.toggleShowDataFields,
  ]);

  return (
    <ToggleIconButton
      isToggled={showDataFields}
      onToggle={toggleShowDataFields}
      icon={<Icon icon={IconCode} />}
      tooltip="Toggle data fields"
      ariaLabel="Toggle data fields"
    />
  );
};
