import type { ChipProps } from "@mui/material/Chip";
import type { SxProps, Theme } from "@mui/material/styles";
import { IconArrowUpRight } from "@tabler/icons-react";
import { Icon } from "ui/icons/Icon";

import { BadgeChip, MenuButton, MenuTitle, StyledChip } from "../styles";
import type { Route } from "../types";

export interface NavMenuButtonProps {
  title: string;
  Icon: Route["Icon"];
  disabled?: boolean;
  isNew?: boolean;
  badgeCount?: string | number;
  badgeColor?: ChipProps["color"];
  isActive: boolean;
  isExternal: boolean;
  onClick: () => void;
  sx?: SxProps<Theme>;
}

const NavMenuButton = ({
  title,
  Icon: icon,
  disabled,
  isNew,
  badgeCount,
  badgeColor = "info",
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
      <Icon icon={icon} fontSize="small" />
      <MenuTitle variant="body3" sx={{ pt: 0.15 }}>
        {title}
      </MenuTitle>
      {isNew && <StyledChip label="new" size="small" color="success" />}
      {badgeCount !== undefined ? (
        <BadgeChip label={badgeCount} color={badgeColor} />
      ) : null}
      {showExternalIcon && (
        <Icon
          icon={IconArrowUpRight}
          sx={{ fontSize: "0.875rem", ml: "auto", mt: 0.2 }}
        />
      )}
    </MenuButton>
  );
};

export default NavMenuButton;
