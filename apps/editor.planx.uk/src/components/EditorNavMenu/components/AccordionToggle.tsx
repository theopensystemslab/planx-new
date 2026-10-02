import { IconChevronDownFilled, IconChevronUp } from "@tabler/icons-react";
import { Icon } from "ui/icons/Icon";

import { MenuButton, MenuTitle } from "../styles";
import type { Route } from "../types";

interface Props {
  subtitle: string;
  Icon: Route["Icon"];
  isOpen: boolean;
  isActive?: boolean;
  onToggle: () => void;
}

const AccordionToggle = ({
  subtitle,
  Icon: icon,
  isOpen,
  isActive = false,
  onToggle,
}: Props) => {
  const ChevronIcon = isOpen ? IconChevronUp : IconChevronDownFilled;
  return (
    <MenuButton
      isActive={isActive}
      aria-expanded={isOpen}
      disableRipple
      onClick={onToggle}
    >
      <Icon icon={icon} fontSize="small" />
      <MenuTitle variant="body3" sx={{ pt: 0.15 }}>
        {subtitle}
      </MenuTitle>
      <Icon icon={ChevronIcon} sx={{ fontSize: "1rem", ml: "auto", mt: 0.2 }} />
    </MenuButton>
  );
};

export default AccordionToggle;
