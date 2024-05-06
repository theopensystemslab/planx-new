import FactCheckIcon from "@mui/icons-material/FactCheck";
import TuneIcon from "@mui/icons-material/Tune";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import { styled } from "@mui/material/styles";
import Tooltip, { tooltipClasses, TooltipProps } from "@mui/material/Tooltip";
import React from "react";
import { useCurrentRoute, useNavigation } from "react-navi";
import { rootFlowPath } from "routes/utils";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";
import EditorIcon from "ui/icons/Editor";

const MENU_WIDTH = "46px";

const Root = styled(Box)(({ theme }) => ({
  width: MENU_WIDTH,
  flexShrink: 0,
  background: theme.palette.background.paper,
  borderRight: `1px solid ${theme.palette.border.main}`,
}));

const MenuWrap = styled("ul")(({ theme }) => ({
  listStyle: "none",
  margin: 0,
  padding: theme.spacing(4, 0, 0, 0),
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

const MenuButton = styled(IconButton, {
  shouldForwardProp: (prop) => prop !== "isActive",
})<{ isActive: boolean }>(({ theme, isActive }) => ({
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
  ...(isActive && {
    background: theme.palette.common.white,
    color: theme.palette.text.primary,
    border: `1px solid ${theme.palette.border.main}`,
    borderRightColor: "transparent",
  }),
}));

function EditorMenu() {
  const { navigate } = useNavigation();
  const { lastChunk } = useCurrentRoute();
  const rootPath = rootFlowPath();

  const isActive = (route: string) => lastChunk.url.pathname.endsWith(route);
  const handleClick = (route: string) =>
    !isActive(route) && navigate(rootPath + route);

  const routes = [
    {
      title: "Editor",
      Icon: EditorIcon,
      route: "/",
    },
    {
      title: "Service settings",
      Icon: TuneIcon,
      route: "/service",
    },
    {
      title: "Submissions log",
      Icon: FactCheckIcon,
      route: "/submissions-log",
    },
  ];

  return (
    <Root>
      <MenuWrap>
        {routes.map(({ title, Icon, route }) => (
          <MenuItem onClick={() => handleClick(route)} key={title}>
            <TooltipWrap title={title}>
              <MenuButton isActive={isActive(route)} disableRipple>
                <Icon />
              </MenuButton>
            </TooltipWrap>
          </MenuItem>
        ))}
      </MenuWrap>
    </Root>
  );
}

export default EditorMenu;
