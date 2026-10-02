import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import { IconArrowUpRight } from "@tabler/icons-react";
import { Icon } from "ui/icons/Icon";

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
      sx={{ px: 1, py: 1.1 }}
    >
      <MenuTitle variant="body3">{title}</MenuTitle>
      {isNew && <StyledChip label="new" size="small" color="success" />}
      {showExternalIcon && (
        <Icon
          icon={IconArrowUpRight}
          sx={{ fontSize: "0.8rem", ml: "auto", mt: 0.2 }}
        />
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
