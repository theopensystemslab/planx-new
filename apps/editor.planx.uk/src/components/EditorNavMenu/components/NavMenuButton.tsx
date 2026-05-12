import NorthEastIcon from "@mui/icons-material/NorthEast";
import { SxProps, Theme } from "@mui/material/styles";
import React from "react";

import { BadgeChip, MenuButton, MenuTitle, StyledChip } from "../styles";
import { Route } from "../types";

export interface NavMenuButtonProps {
  title: string;
  Icon: Route["Icon"];
  disabled?: boolean;
  isNew?: boolean;
  badgeCount?: number;
  isActive: boolean;
  isExternal: boolean;
  onClick: () => void;
  sx?: SxProps<Theme>;
}

const NavMenuButton = ({
  title,
  Icon,
  disabled,
  isNew,
  badgeCount,
  isActive,
  isExternal,
  onClick,
  sx,
}: NavMenuButtonProps) => {
  const showExternalIcon = isExternal && !disabled;
  return (
    <MenuButton
      isActive={isActive}
      disabled={disabled}
      disableRipple
      onClick={onClick}
      sx={sx}
    >
      <Icon fontSize="small" />
      <MenuTitle variant="body3" sx={{ pt: 0.15 }}>
        {title}
      </MenuTitle>
      {isNew && <StyledChip label="new" size="small" color="success" />}
      {badgeCount ? <BadgeChip label={badgeCount} color="info" /> : null}
      {showExternalIcon && (
        <NorthEastIcon sx={{ fontSize: "0.875rem", ml: "auto", mt: 0.2 }} />
      )}
    </MenuButton>
  );
};

export default NavMenuButton;
