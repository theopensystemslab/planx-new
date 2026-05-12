import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";

import { MenuButton } from "../styles";
import NavMenuButton, { NavMenuButtonProps } from "./NavMenuButton";

interface Props extends NavMenuButtonProps {
  compact: boolean;
}

const NavMenuItem = ({
  title,
  Icon,
  disabled,
  isNew,
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
    >
      <Icon sx={{ fontSize: "1.4rem" }} />
    </MenuButton>
  ) : (
    <NavMenuButton
      title={title}
      Icon={Icon}
      isActive={isActive}
      isExternal={isExternal}
      disabled={disabled}
      isNew={isNew}
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
