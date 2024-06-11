import GroupIcon from "@mui/icons-material/Group";
import PaletteIcon from "@mui/icons-material/Palette";
import ViewListIcon from "@mui/icons-material/ViewList";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import React from "react";
import { useCurrentRoute, useNavigation } from "react-navi";
import { rootFlowPath } from "routes/utils";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";

const MENU_WIDTH = "185px";

const Root = styled(Box)(({ theme }) => ({
  width: MENU_WIDTH,
  flexShrink: 0,
  background: theme.palette.background.paper,
  borderRight: `1px solid ${theme.palette.border.light}`,
}));

const MenuWrap = styled("ul")(({ theme }) => ({
  listStyle: "none",
  margin: 0,
  padding: theme.spacing(2.5, 0.5, 0, 0.5),
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
  color: theme.palette.text.primary,
  width: "100%",
  border: "1px solid transparent",
  justifyContent: "flex-start",
  borderRadius: "3px",
  "&:hover": {
    background: "white",
    borderColor: theme.palette.border.light,
  },
  ...(isActive && {
    background: theme.palette.common.white,
    color: theme.palette.text.primary,
    border: `1px solid ${theme.palette.border.light}`,
  }),
  "& > svg": {
    width: "20px",
  },
}));

function TeamMenu() {
  const { navigate } = useNavigation();
  const { url } = useCurrentRoute();
  const rootPath = rootFlowPath();

  const isActive = (route: string) => url.pathname.endsWith(route);
  const handleClick = (route: string) =>
    !isActive(route) && navigate(rootPath + route);

  const routes = [
    {
      title: "Services",
      Icon: ViewListIcon,
      route: "/",
    },
    {
      title: "Team members",
      Icon: GroupIcon,
      route: "/members",
    },
    {
      title: "Design",
      Icon: PaletteIcon,
      route: "/settings/design",
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

export default TeamMenu;
