import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import React from "react";

import { BadgeChip, MenuButton } from "../styles";
import NavMenuButton, { NavMenuButtonProps } from "./NavMenuButton";

interface Props extends NavMenuButtonProps {
  compact: boolean;
}

const NavMenuItem = ({
  title,
  Icon,
  disabled,
  isNew,
  badge,
  isActive,
  isExternal,
  compact,
  onClick,
}: Props) => {
  const tooltipTitle = disabled ? `${title} unavailable` : title;
  const showTooltip = compact || disabled;

  const buttonContent = compact ? (
    <MenuButton
      title={title}
      isActive={isActive}
      disabled={disabled}
      disableRipple
      onClick={onClick}
      sx={{ padding: "8px" }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.25 }}>
        <Icon />
        {badge ? <BadgeChip label={badge} color="info" sx={{ marginLeft: 0 }} /> : null}
      </Box>
    </MenuButton>
  ) : (
    <NavMenuButton
      title={title}
      Icon={Icon}
      isActive={isActive}
      isExternal={isExternal}
      disabled={disabled}
      isNew={isNew}
      badge={badge}
      onClick={onClick}
    />
  );

  if (showTooltip) {
    return (
      <Tooltip title={tooltipTitle} placement="right">
        <Box component="span">{buttonContent}</Box>
      </Tooltip>
    );
  }

  return buttonContent;
};

export default NavMenuItem;
