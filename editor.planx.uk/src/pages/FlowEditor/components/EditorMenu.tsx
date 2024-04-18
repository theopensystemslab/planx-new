import EqualizerIcon from '@mui/icons-material/Equalizer';
import FlagIcon from '@mui/icons-material/Flag';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import IosShareIcon from '@mui/icons-material/IosShare';
import PeopleIcon from '@mui/icons-material/People';
import RuleFolderIcon from '@mui/icons-material/RuleFolder';
import ShareIcon from '@mui/icons-material/Share';
import Box from "@mui/material/Box";
import IconButton from '@mui/material/IconButton';
import { styled } from "@mui/material/styles";
import Tooltip, { tooltipClasses,TooltipProps } from '@mui/material/Tooltip';
import React from "react";
import { FONT_WEIGHT_SEMI_BOLD } from 'theme';

const MENU_WIDTH = "46px";

const Root = styled(Box)(({ theme }) => ({
  width: MENU_WIDTH,
  flexShrink: 0,
  background: theme.palette.background.paper,
  borderRight:`1px solid ${theme.palette.border.main}`,
}));

const MenuWrap = styled("ul")(({ theme }) => ({
  listStyle: "none",
  margin: 0,
  padding: theme.spacing(5, 0, 0, 0),
}));

const MenuItem = styled("li")(({ theme }) => ({
  margin: theme.spacing(0.75, 0),
  padding: 0,
}));

const TooltipWrap = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} arrow placement="right" classes={{ popper: className }} />
))(() => ({
  [`& .${tooltipClasses.arrow}`]: {
    color: "#2c2c2c",
  },
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: "#2c2c2c",
    left: "-5px",
    fontSize: "0.8em",
    borderRadius: 0,
    fontWeight: FONT_WEIGHT_SEMI_BOLD,
  },
}));

const MenuButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.primary.main,
  width: MENU_WIDTH,
  height: MENU_WIDTH,
  border: "1px solid transparent",
  borderRightColor: theme.palette.border.main,
  "&:hover": {
    background: "white",
    borderTopColor: theme.palette.border.light,
    borderBottomColor: theme.palette.border.light,
  },
  "&[data-state='active']": {
    background: theme.palette.common.white,
    color: theme.palette.text.primary,
    border: `1px solid ${theme.palette.border.main}`,
    borderRightColor: "transparent",
  },
}));

function EditorMenu() {
  return (
    <Root>
      <MenuWrap>
        <MenuItem>
          <TooltipWrap title="Editor">
            <MenuButton data-state="active" disableRipple>
              <FormatListBulletedIcon />
            </MenuButton>
          </TooltipWrap>
        </MenuItem>
        <MenuItem>
          <TooltipWrap title="Versions">
            <MenuButton disableRipple>
              <ShareIcon />
            </MenuButton>
          </TooltipWrap>
        </MenuItem>
        <MenuItem>
          <TooltipWrap title="Analtyics">
            <MenuButton disableRipple>
              <EqualizerIcon />
            </MenuButton>
          </TooltipWrap>
        </MenuItem>
        <MenuItem>
          <TooltipWrap title="Team settings">
            <MenuButton disableRipple>
              <PeopleIcon />
            </MenuButton>
          </TooltipWrap>
        </MenuItem>
        <MenuItem>
          <TooltipWrap title="Sharing">
            <MenuButton disableRipple>
              <IosShareIcon />
            </MenuButton>
          </TooltipWrap>
        </MenuItem>
        <MenuItem>
          <TooltipWrap title="Service flags">
            <MenuButton disableRipple>
              <FlagIcon />
            </MenuButton>
          </TooltipWrap>
        </MenuItem>
        <MenuItem>
          <TooltipWrap title="Submissions log">
            <MenuButton disableRipple>
              <RuleFolderIcon />
            </MenuButton>
          </TooltipWrap>
        </MenuItem>
      </MenuWrap>
    </Root>
  );
}

export default EditorMenu;
