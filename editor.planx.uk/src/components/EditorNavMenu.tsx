import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import GroupIcon from "@mui/icons-material/Group";
import Info from "@mui/icons-material/Info";
import LeaderboardIcon from "@mui/icons-material/Leaderboard";
import PaletteIcon from "@mui/icons-material/Palette";
import TuneIcon from "@mui/icons-material/Tune";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import { styled } from "@mui/material/styles";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { Role } from "@opensystemslab/planx-core/types";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useRef } from "react";
import { useCurrentRoute, useLoadingRoute, useNavigation } from "react-navi";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";
import EditorIcon from "ui/icons/Editor";

interface Route {
  title: string;
  Icon: React.ElementType;
  route: string;
  accessibleBy: Role[];
  disabled?: boolean;
}

interface RoutesForURL {
  routes: Route[];
  compact: boolean;
}

const MENU_WIDTH_COMPACT = "51px";
const MENU_WIDTH_FULL = "164px";

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

const MenuButton = styled(IconButton, {
  shouldForwardProp: (prop) => prop !== "isActive",
})<{ isActive: boolean }>(({ theme, isActive, disabled }) => ({
  color: theme.palette.text.primary,
  width: "100%",
  border: "1px solid transparent",
  justifyContent: "flex-start",
  borderRadius: "3px",
  "&:hover": {
    background: theme.palette.common.white,
    borderColor: theme.palette.border.light,
  },
  ...(isActive && {
    background: theme.palette.common.white,
    color: theme.palette.text.primary,
    border: `1px solid ${theme.palette.border.main}`,
  }),
  ...(disabled && {
    color: theme.palette.text.disabled,
    "&:hover": {
      background: "none",
      borderColor: "transparent",
    },
  }),
  "& > svg": {
    opacity: 0.8,
  },
}));

function EditorNavMenu() {
  const { navigate } = useNavigation();
  const { url } = useCurrentRoute();
  const isRouteLoading = useLoadingRoute();
  const [teamSlug, flowSlug, flowAnalyticsLink, role] = useStore((state) => [
    state.teamSlug,
    state.flowSlug,
    state.flowAnalyticsLink,
    state.getUserRoleForCurrentTeam(),
  ]);

  const isActive = (route: string) => url.href.endsWith(route);

  const handleClick = (route: string, disabled?: boolean) => {
    if (isActive(route) || disabled) return;
    const isExternalLink =
      route.startsWith("http://") || route.startsWith("https://");
    if (isExternalLink) {
      window.open(route, "_blank");
    } else {
      navigate(route);
    }
  };

  const globalLayoutRoutes: Route[] = [
    {
      title: "Select a team",
      Icon: FormatListBulletedIcon,
      route: "/",
      accessibleBy: ["platformAdmin", "teamEditor", "demoUser", "teamViewer"],
    },
    {
      title: "Global settings",
      Icon: TuneIcon,
      route: "global-settings",
      accessibleBy: ["platformAdmin"],
    },
    {
      title: "Admin panel",
      Icon: AdminPanelSettingsIcon,
      route: "admin-panel",
      accessibleBy: ["platformAdmin"],
    },
  ];

  const teamLayoutRoutes: Route[] = [
    {
      title: "Services",
      Icon: FormatListBulletedIcon,
      route: `/${teamSlug}`,
      accessibleBy: ["platformAdmin", "teamEditor", "demoUser", "teamViewer"],
    },
    {
      title: "Settings",
      Icon: TuneIcon,
      route: `/${teamSlug}/general-settings`,
      accessibleBy: ["platformAdmin", "teamEditor"],
    },
    {
      title: "Design",
      Icon: PaletteIcon,
      route: `/${teamSlug}/design`,
      accessibleBy: ["platformAdmin", "teamEditor"],
    },
    {
      title: "Team members",
      Icon: GroupIcon,
      route: `/${teamSlug}/members`,
      accessibleBy: ["platformAdmin", "teamEditor"],
    },
  ];

  const flowLayoutRoutesMain: Route[] = [
    {
      title: "Editor",
      Icon: EditorIcon,
      route: `/${teamSlug}/${flowSlug}`,
      accessibleBy: ["platformAdmin", "teamEditor", "demoUser", "teamViewer"],
    },
    {
      title: "Feedback",
      Icon: Info,
      route: `/${teamSlug}/${flowSlug}/feedback`,
      accessibleBy: ["platformAdmin", "teamEditor", "demoUser"],
    },
    {
      title: "Service settings",
      Icon: TuneIcon,
      route: `/${teamSlug}/${flowSlug}/service`,
      accessibleBy: ["platformAdmin", "teamEditor", "demoUser"],
    },
    {
      title: "Submissions log",
      Icon: FactCheckIcon,
      route: `/${teamSlug}/${flowSlug}/submissions-log`,
      accessibleBy: ["platformAdmin", "teamEditor", "demoUser"],
    },
  ];

  const flowAnalyticsRoute: Route[] = flowAnalyticsLink
    ? [
        {
          title: "Analytics (external link)",
          Icon: LeaderboardIcon,
          route: flowAnalyticsLink,
          accessibleBy: ["platformAdmin", "teamEditor", "demoUser"],
        },
      ]
    : [
        {
          title: "Analytics page unavailable",
          Icon: LeaderboardIcon,
          route: "#",
          accessibleBy: ["platformAdmin", "teamEditor", "demoUser"],
          disabled: true,
        },
      ];

  const flowLayoutRoutes: Route[] = [
    ...flowLayoutRoutesMain,
    ...flowAnalyticsRoute,
  ];

  const defaultRoutes: RoutesForURL = {
    routes: globalLayoutRoutes,
    compact: false,
  };
  const previousRoutes = useRef<RoutesForURL>(defaultRoutes);

  const getRoutesForUrl = (url: string): RoutesForURL => {
    // Return the previous value when route is loading to avoid flash of incorrect version
    if (isRouteLoading) return previousRoutes.current;

    let result: RoutesForURL;

    if (flowSlug && url.includes(flowSlug)) {
      result = { routes: flowLayoutRoutes, compact: true };
    } else if (teamSlug && url.includes(teamSlug)) {
      result = { routes: teamLayoutRoutes, compact: false };
    } else {
      result = defaultRoutes;
    }

    previousRoutes.current = result;

    return result;
  };

  const { routes, compact } = getRoutesForUrl(url.href);

  const visibleRoutes = routes.filter(
    ({ accessibleBy }) => role && accessibleBy.includes(role),
  );

  // Hide menu if the user does not have a selection of items
  if (visibleRoutes.length < 2) return null;

  return (
    <Root compact={compact}>
      <MenuWrap>
        {visibleRoutes.map(({ title, Icon, route, disabled }) => (
          <MenuItem key={title}>
            {compact ? (
              <Tooltip title={title} placement="right">
                <Box component="span">
                  <MenuButton
                    title={title}
                    isActive={isActive(route)}
                    disabled={disabled}
                    disableRipple
                    onClick={() => handleClick(route, disabled)}
                  >
                    <Icon />
                  </MenuButton>
                </Box>
              </Tooltip>
            ) : (
              <MenuButton
                isActive={isActive(route)}
                disabled={disabled}
                disableRipple
                onClick={() => handleClick(route, disabled)}
              >
                <Icon fontSize="small" />
                <MenuTitle variant="body3">{title}</MenuTitle>
              </MenuButton>
            )}
          </MenuItem>
        ))}
      </MenuWrap>
    </Root>
  );
}

export default EditorNavMenu;
