import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import GroupIcon from "@mui/icons-material/Group";
import PaletteIcon from "@mui/icons-material/Palette";
import RateReviewIcon from "@mui/icons-material/RateReview";
import TuneIcon from "@mui/icons-material/Tune";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import { styled } from "@mui/material/styles";
import Tooltip, { tooltipClasses, TooltipProps } from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { useCurrentRoute, useNavigation } from "react-navi";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";
import EditorIcon from "ui/icons/Editor";

interface Route {
  title: string;
  Icon: React.ElementType;
  route: string;
}

const MENU_WIDTH_COMPACT = "52px";
const MENU_WIDTH_FULL = "178px";

const Root = styled(Box, {
  shouldForwardProp: (prop) => prop !== "compact",
})<{ compact?: boolean }>(({ theme, compact }) => ({
  width: compact ? MENU_WIDTH_COMPACT : MENU_WIDTH_FULL,
  flexShrink: 0,
  background: theme.palette.background.paper,
  borderRight: `1px solid ${theme.palette.border.light}`,
}));

const MenuWrap = styled("ul")(({ theme }) => ({
  listStyle: "none",
  margin: 0,
  padding: theme.spacing(1, 0.4, 0, 0.4),
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
    border: `1px solid ${theme.palette.border.main}`,
  }),
  "& > svg": {
    opacity: 0.8,
  },
}));

function EditorNavMenu() {
  const { navigate } = useNavigation();
  const { url } = useCurrentRoute();
  const [teamSlug, flowSlug] = useStore((state) => [
    state.teamSlug,
    state.flowSlug,
  ]);

  const isActive = (route: string) => url.href.endsWith(route);

  const handleClick = (route: string) => {
    if (isActive(route)) return;
    navigate(route);
  };

  const globalLayoutRoutes: Route[] = [
    {
      title: "Select a team",
      Icon: FormatListBulletedIcon,
      route: "/",
    },
    {
      title: "Admin panel",
      Icon: AdminPanelSettingsIcon,
      route: "admin-panel",
    },
    {
      title: "Global settings",
      Icon: TuneIcon,
      route: "global-settings",
    },
  ];

  const teamLayoutRoutes: Route[] = [
    {
      title: "Services",
      Icon: FormatListBulletedIcon,
      route: `/${teamSlug}`,
    },
    {
      title: "Team members",
      Icon: GroupIcon,
      route: `/${teamSlug}/members`,
    },
    {
      title: "Design",
      Icon: PaletteIcon,
      route: `/${teamSlug}/design`,
    },
  ];

  const flowLayoutRoutes: Route[] = [
    {
      title: "Editor",
      Icon: EditorIcon,
      route: `/${teamSlug}/${flowSlug}`,
    },
    {
      title: "Service settings",
      Icon: TuneIcon,
      route: `/${teamSlug}/${flowSlug}/service`,
    },
    {
      title: "Submissions log",
      Icon: FactCheckIcon,
      route: `/${teamSlug}/${flowSlug}/submissions-log`,
    },
    {
      title: "Feedback",
      Icon: RateReviewIcon,
      route: `/${teamSlug}/${flowSlug}/feedback`,
    },
  ];

  const getRoutesForUrl = (
    url: string,
  ): { routes: Route[]; compact: boolean } => {
    if (flowSlug && url.includes(flowSlug))
      return { routes: flowLayoutRoutes, compact: true };
    if (teamSlug && url.includes(teamSlug))
      return { routes: teamLayoutRoutes, compact: false };
    return { routes: globalLayoutRoutes, compact: false };
  };

  const { routes, compact } = getRoutesForUrl(url.href);

  return (
    <Root compact={compact}>
      <MenuWrap>
        {routes.map(({ title, Icon, route }) => (
          <MenuItem onClick={() => handleClick(route)} key={title}>
            {compact ? (
              <TooltipWrap title={title}>
                <MenuButton isActive={isActive(route)} disableRipple>
                  <Icon />
                </MenuButton>
              </TooltipWrap>
            ) : (
              <MenuButton isActive={isActive(route)} disableRipple>
                <Icon />
                <MenuTitle variant="body2">{title}</MenuTitle>
              </MenuButton>
            )}
          </MenuItem>
        ))}
      </MenuWrap>
    </Root>
  );
}

export default EditorNavMenu;
