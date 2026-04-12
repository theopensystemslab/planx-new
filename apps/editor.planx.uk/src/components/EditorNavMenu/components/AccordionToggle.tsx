import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import React from "react";

import { MenuButton, MenuTitle } from "../styles";
import { Route } from "../types";

interface Props {
  subtitle: string;
  Icon: Route["Icon"];
  isOpen: boolean;
  onToggle: () => void;
}

const AccordionToggle = ({ subtitle, Icon, isOpen, onToggle }: Props) => {
  const ChevronIcon = isOpen ? ExpandLessIcon : ExpandMoreIcon;
  return (
    <MenuButton isActive={false} disableRipple onClick={onToggle}>
      <Icon fontSize="small" />
      <MenuTitle variant="body3" pt={0.15}>
        {subtitle}
      </MenuTitle>
      <ChevronIcon sx={{ fontSize: "1rem", ml: "auto", mt: 0.2 }} />
    </MenuButton>
  );
};

export default AccordionToggle;
