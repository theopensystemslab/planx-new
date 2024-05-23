import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import TuneIcon from "@mui/icons-material/Tune";
import ViewListIcon from "@mui/icons-material/ViewList";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import React from "react";
import { useCurrentRoute, useNavigation } from "react-navi";
import { rootFlowPath } from "routes/utils";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";

const MENU_WIDTH = "180px";

const Root = styled(Box)(({ theme }) => ({
  width: MENU_WIDTH,
  flexShrink: 0,
  background: theme.palette.background.paper,
  borderRight: `1px solid ${theme.palette.border.main}`,
}));

const MenuWrap = styled("ul")(({ theme }) => ({
  listStyle: "none",
  margin: 0,
  padding: theme.spacing(2.5, 0, 0, 0),
  position: "sticky",
  top: 0,
}));

const MenuItem = styled("li")(({ theme }) => ({
  margin: theme.spacing(0.75, 0),
  padding: 0,
}));

const MenuTitle = styled(Typography)(({ theme }) => ({
  fontWeight: FONT_WEIGHT_SEMI_BOLD,
  paddingLeft: theme.spacing(0.5),
  textAlign: "left",
})) as typeof Typography;

const MenuButton = styled(IconButton, {
  shouldForwardProp: (prop) => prop !== "isActive",
})<{ isActive: boolean }>(({ theme, isActive }) => ({
  color: theme.palette.primary.main,
  width: MENU_WIDTH,
  border: "1px solid transparent",
  borderRightColor: theme.palette.border.main,
  justifyContent: "flex-start",
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

function GlobalMenu() {
  const { navigate } = useNavigation();
  const { url } = useCurrentRoute();
  const rootPath = rootFlowPath();

  const isActive = (route: string) => url.pathname.endsWith(route);
  const handleClick = (route: string) =>
    !isActive(route) && navigate(rootPath + route);

  const routes = [
    {
      title: "Select a team",
      Icon: ViewListIcon,
      route: "/",
    },
    {
      title: "Admin panel",
      Icon: AdminPanelSettingsIcon,
      route: "/admin-panel",
    },
    {
      title: "Global settings",
      Icon: TuneIcon,
      route: "/global-settings",
    },
  ];

  return (
    <Root>
      <MenuWrap>
        {routes.map(({ title, Icon, route }) => (
          <MenuItem onClick={() => handleClick(route)} key={title}>
            <MenuButton isActive={isActive(route)} disableRipple>
              <Icon />
              <MenuTitle variant="body2">{title}</MenuTitle>
            </MenuButton>
          </MenuItem>
        ))}
      </MenuWrap>
    </Root>
  );
}

export default GlobalMenu;
