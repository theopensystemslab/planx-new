import NorthEastIcon from "@mui/icons-material/NorthEast";
import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import React from "react";

import { MenuButton, MenuTitle, StyledChip } from "../styles";

interface Props {
  title: string;
  disabled?: boolean;
  isNew?: boolean;
  isActive: boolean;
  isExternal: boolean;
  onClick: () => void;
}

const AccordionItemButton = ({
  title,
  disabled,
  isNew,
  isActive,
  isExternal,
  onClick,
}: Props) => {
  const showExternalIcon = isExternal && !disabled;

  const button = (
    <MenuButton
      isActive={isActive}
      disabled={disabled}
      disableRipple
      onClick={onClick}
      sx={{ p: 0.8 }}
    >
      <MenuTitle variant="body3" pt={0.15}>
        {title}
      </MenuTitle>
      {isNew && <StyledChip label="new" size="small" color="success" />}
      {showExternalIcon && (
        <NorthEastIcon sx={{ fontSize: "0.8rem", ml: "auto", mt: 0.2 }} />
      )}
    </MenuButton>
  );

  if (disabled) {
    return (
      <Tooltip title={`${title} unavailable`} placement="right">
        <Box component="span">{button}</Box>
      </Tooltip>
    );
  }

  return button;
};

export default AccordionItemButton;
