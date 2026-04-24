import NorthEastIcon from "@mui/icons-material/NorthEast";
import React from "react";

import { BadgeChip, MenuButton, MenuTitle, StyledChip } from "../styles";
import { Route } from "../types";

export interface NavMenuButtonProps {
  title: string;
  Icon: Route["Icon"];
  disabled?: boolean;
  isNew?: boolean;
  badge?: number;
  isActive: boolean;
  isExternal: boolean;
  onClick: () => void;
}

const NavMenuButton = ({
  title,
  Icon,
  disabled,
  isNew,
  badge,
  isActive,
  isExternal,
  onClick,
}: NavMenuButtonProps) => {
  const showExternalIcon = isExternal && !disabled;
  return (
    <MenuButton
      isActive={isActive}
      disabled={disabled}
      disableRipple
      onClick={onClick}
    >
      <Icon fontSize="small" />
      <MenuTitle variant="body3" sx={{ pt: 0.15 }}>
        {title}
      </MenuTitle>
      {isNew && <StyledChip label="new" size="small" color="success" />}
      {badge ? <BadgeChip label={badge} color="info" /> : null}
      {showExternalIcon && (
        <NorthEastIcon sx={{ fontSize: "0.875rem", ml: "auto", mt: 0.2 }} />
      )}
    </MenuButton>
  );
};

export default NavMenuButton;
