import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import GroupIcon from "@mui/icons-material/Group";
import LeaderboardIcon from "@mui/icons-material/Leaderboard";
import PaletteIcon from "@mui/icons-material/Palette";
import RateReviewIcon from "@mui/icons-material/RateReview";
import TuneIcon from "@mui/icons-material/Tune";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import { styled } from "@mui/material/styles";
import Tooltip, { tooltipClasses, TooltipProps } from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { Role } from "@opensystemslab/planx-core/types";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { useCurrentRoute, useNavigation } from "react-navi";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";
import EditorIcon from "ui/icons/Editor";

interface Route {
  title: string;
  Icon: React.ElementType;
  route: string;
  accessibleBy: Role[];
  disabled?: boolean;
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
  shouldForwardProp: (prop) =>
    !["isActive", "disabled"].includes(prop as string),
})<{ isActive: boolean; disabled?: boolean }>(
  ({ theme, isActive, disabled }) => ({
    color: theme.palette.text.primary,
    width: "100%",
    border: "1px solid transparent",
    justifyContent: "flex-start",
    borderRadius: "3px",
    "&:hover": {
      background: disabled ? "none" : theme.palette.common.white,
      borderColor: disabled ? "transparent" : theme.palette.border.light,
    },
    ...(isActive && {
      background: theme.palette.common.white,
      color: theme.palette.text.primary,
      border: `1px solid ${theme.palette.border.main}`,
    }),
    ...(disabled && {
      color: theme.palette.text.disabled,
    }),
    "& > svg": {
      opacity: 0.8,
    },
  }),
);

function EditorNavMenu() {
  const { navigate } = useNavigation();
  const { url } = useCurrentRoute();
  const [teamSlug, flowSlug, user, canUserEditTeam, flowAnalyticsLink] =
    useStore((state) => [
      state.teamSlug,
      state.flowSlug,
      state.user,
      state.canUserEditTeam,
      state.flowAnalyticsLink,
    ]);

  const isActive = (route: string) => url.href.endsWith(route);

  const handleClick = (route: string, disabled?: boolean) => {
    if (isActive(route) || disabled) return;
    if (route.startsWith("http://") || route.startsWith("https://")) {
      window.open(route, "_blank");
    } else {
      navigate(route);
    }
  };

  const platformAdmin: Role = "platformAdmin";
  const teamEditor: Role = "teamEditor";
  const teamViewer: Role = "teamViewer";

  const globalLayoutRoutes: Route[] = [
    {
      title: "Select a team",
      Icon: FormatListBulletedIcon,
      route: "/",
      accessibleBy: [platformAdmin, teamEditor, teamViewer],
    },
    {
      title: "Global settings",
      Icon: TuneIcon,
      route: "global-settings",
      accessibleBy: [platformAdmin],
    },
    {
      title: "Admin panel",
      Icon: AdminPanelSettingsIcon,
      route: "admin-panel",
      accessibleBy: [platformAdmin],
    },
  ];

  const teamLayoutRoutes: Route[] = [
    {
      title: "Services",
      Icon: FormatListBulletedIcon,
      route: `/${teamSlug}`,
      accessibleBy: [platformAdmin, teamEditor, teamViewer],
    },
    {
      title: "Settings",
      Icon: TuneIcon,
      route: `/${teamSlug}/general-settings`,
      accessibleBy: [platformAdmin, teamEditor],
    },
    {
      title: "Design",
      Icon: PaletteIcon,
      route: `/${teamSlug}/design`,
      accessibleBy: [platformAdmin, teamEditor],
    },
    {
      title: "Team members",
      Icon: GroupIcon,
      route: `/${teamSlug}/members`,
      accessibleBy: [platformAdmin, teamEditor],
    },
  ];

  const flowLayoutRoutes: Route[] = [
    {
      title: "Editor",
      Icon: EditorIcon,
      route: `/${teamSlug}/${flowSlug}`,
      accessibleBy: [platformAdmin, teamEditor, teamViewer],
    },
    {
      title: "Service settings",
      Icon: TuneIcon,
      route: `/${teamSlug}/${flowSlug}/service`,
      accessibleBy: [platformAdmin, teamEditor],
    },
    {
      title: "Submissions log",
      Icon: FactCheckIcon,
      route: `/${teamSlug}/${flowSlug}/submissions-log`,
      accessibleBy: [platformAdmin, teamEditor],
    },
    {
      title: "Feedback",
      Icon: RateReviewIcon,
      route: `/${teamSlug}/${flowSlug}/feedback`,
      accessibleBy: [platformAdmin, teamEditor],
    },
    ...(flowAnalyticsLink
      ? [
          {
            title: "Analytics (external link)",
            Icon: LeaderboardIcon,
            route: flowAnalyticsLink,
            accessibleBy: [platformAdmin, teamEditor],
          },
        ]
      : [
          {
            title: "Analytics page unavailable",
            Icon: LeaderboardIcon,
            route: "#",
            accessibleBy: [platformAdmin, teamEditor],
            disabled: true,
          },
        ]),
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

  const visibleRoutes = routes.filter(({ accessibleBy }) => {
    if (user?.isPlatformAdmin) return accessibleBy.includes("platformAdmin");
    if (canUserEditTeam(teamSlug)) return accessibleBy.includes("teamEditor");
    return accessibleBy.includes("teamViewer");
  });

  // Hide menu if the user does not have a selection of items
  if (visibleRoutes.length < 2) return null;

  return (
    <Root compact={compact}>
      <MenuWrap>
        {visibleRoutes.map(({ title, Icon, route, disabled }) => (
          <MenuItem onClick={() => handleClick(route, disabled)} key={title}>
            {compact ? (
              <TooltipWrap title={title}>
                <MenuButton
                  isActive={isActive(route)}
                  disabled={disabled}
                  disableRipple
                >
                  <Icon />
                </MenuButton>
              </TooltipWrap>
            ) : (
              <MenuButton
                isActive={isActive(route)}
                disabled={disabled}
                disableRipple
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
