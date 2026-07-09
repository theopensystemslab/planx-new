import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";

import { BadgeChip, MenuButton } from "../styles";
import type { NavMenuButtonProps } from "./NavMenuButton";
import NavMenuButton from "./NavMenuButton";

interface Props extends NavMenuButtonProps {
  compact: boolean;
}

const NavMenuItem = ({
  title,
  Icon,
  disabled,
  isNew,
  badgeCount,
  badgeColor = "info",
  isActive,
  isExternal,
  compact,
  onClick,
  sx,
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
      sx={{ padding: "8px", ...sx }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 0.25,
        }}
      >
        <Icon sx={{ fontSize: "1.4rem" }} />
        {badgeCount !== undefined ? (
          <BadgeChip
            label={badgeCount}
            color={badgeColor}
            sx={{
              marginLeft: 0,
              "& .MuiChip-label": { padding: "0 4px" },
            }}
          />
        ) : null}
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
      badgeCount={badgeCount}
      badgeColor={badgeColor}
      onClick={onClick}
      sx={sx}
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
