import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import React from "react";

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
  if (compact) {
    return (
      <Tooltip title={title} placement="right">
        <Box component="span">
          <MenuButton
            title={title}
            isActive={isActive}
            disabled={disabled}
            disableRipple
            onClick={onClick}
            sx={{ padding: "8px" }}
          >
            <Icon />
          </MenuButton>
        </Box>
      </Tooltip>
    );
  }

  if (disabled) {
    return (
      <Tooltip title={`${title} unavailable`} placement="right">
        <Box component="span">
          <NavMenuButton
            title={title}
            Icon={Icon}
            isActive={isActive}
            isExternal={isExternal}
            disabled={disabled}
            isNew={isNew}
            onClick={onClick}
          />
        </Box>
      </Tooltip>
    );
  }

  return (
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
};

export default NavMenuItem;
