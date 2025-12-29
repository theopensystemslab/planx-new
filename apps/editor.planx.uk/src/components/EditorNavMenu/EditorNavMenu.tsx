import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import CurrencyPoundIcon from "@mui/icons-material/CurrencyPound";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import GroupIcon from "@mui/icons-material/Group";
import LayersIcon from "@mui/icons-material/Layers";
import LeaderboardIcon from "@mui/icons-material/Leaderboard";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import RateReviewIcon from "@mui/icons-material/RateReview";
import SchoolIcon from "@mui/icons-material/School";
import TuneIcon from "@mui/icons-material/Tune";
import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import { useLocation, useNavigate, useRouter } from "@tanstack/react-router";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useRef } from "react";
import EditorIcon from "ui/icons/Editor";
import LocalPlanningServicesIcon from "ui/icons/LocalPlanningServices";

import { useLPS } from "../../hooks/useLPS";
import { MenuButton, MenuItem, MenuTitle, MenuWrap, Root } from "./styles";
import { Route, RoutesForURL } from "./types";

function EditorNavMenu() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const router = useRouter();
  const [teamSlug, flowSlug, flowAnalyticsLink, role, team] = useStore(
    (state) => [
      state.teamSlug,
      state.flowSlug,
      state.flowAnalyticsLink,
      state.getUserRoleForCurrentTeam(),
      state.getTeam(),
      state.teamAnalyticsLink,
    ]);
  const referenceCode = team?.settings?.referenceCode;
  const { url: lpsBaseUrl } = useLPS();

  const isActive = (route: string) => {
    const currentPath = pathname;

    // Factor in nested routes when determining active state
    if (route.includes("/settings")) {
      return currentPath.startsWith(route);
    }

    return currentPath.endsWith(route);
  };

  const handleClick = (route: string, disabled?: boolean) => {
    if (isActive(route) || disabled) return;
    const isExternalLink =
      route.startsWith("http://") || route.startsWith("https://");
    if (isExternalLink) {
      window.open(route, "_blank");
    } else {
      navigate({ to: route });
    }
  };

  const globalLayoutRoutes: Route[] = [
    {
      title: "Select a team",
      Icon: FormatListBulletedIcon,
      route: "/",
      accessibleBy: "*",
    },
    {
      title: "Global settings",
      Icon: TuneIcon,
      route: "/global-settings",
      accessibleBy: ["platformAdmin"],
    },
    {
      title: "Admin panel",
      Icon: AdminPanelSettingsIcon,
      route: "/admin-panel",
      accessibleBy: ["platformAdmin", "analyst"],
    },
    {
      title: "Resources",
      Icon: MenuBookIcon,
      route: "/resources",
      accessibleBy: "*",
    },
    {
      title: "Onboarding",
      Icon: AssignmentTurnedInIcon,
      route: "/onboarding",
      accessibleBy: "*",
    },
    {
      title: "Tutorials",
      Icon: SchoolIcon,
      route: "/tutorials",
      accessibleBy: "*",
    },
  ];

  const teamLayoutRoutes: Route[] = [
    {
      title: "Flows",
      Icon: FormatListBulletedIcon,
      route: `/${teamSlug}`,
      accessibleBy: "*",
    },
    {
      title: "Settings",
      Icon: TuneIcon,
      route: `/${teamSlug}/settings`,
      accessibleBy: ["platformAdmin", "teamEditor"],
    },
    {
      title: "Team members",
      Icon: GroupIcon,
      route: `/${teamSlug}/members`,
      accessibleBy: ["platformAdmin", "teamEditor"],
    },
    {
      title: "Subscription",
      Icon: CurrencyPoundIcon,
      route: `/${teamSlug}/subscription`,
      accessibleBy: ["platformAdmin", "teamEditor"],
    },
    {
      title: "Feedback",
      Icon: RateReviewIcon,
      route: `/${teamSlug}/feedback`,
      accessibleBy: ["platformAdmin", "teamEditor", "demoUser"],
    },
    {
      title: "Submissions",
      Icon: FactCheckIcon,
      route: `/${teamSlug}/submissions`,
      accessibleBy: ["platformAdmin", "teamEditor", "demoUser"],
    },
    {
      title: referenceCode
        ? `Planning Data (external link)`
        : `Planning Data unavailable`,
      Icon: LayersIcon,
      route: referenceCode
        ? `https://provide.planning.data.gov.uk/organisations/local-authority:${referenceCode}`
        : `#`,
      accessibleBy: "*",
      disabled: !referenceCode,
    },
    {
      title: referenceCode
        ? `Local Planning Services (external link)`
        : `Local Planning Services unavailable`,
      Icon: LocalPlanningServicesIcon,
      route: referenceCode ? `${lpsBaseUrl}/${teamSlug}` : `#`,
      accessibleBy: "*",
      disabled: !referenceCode,
    },
    {
      title: "Analytics",
      Icon: LeaderboardIcon,
      route: teamAnalyticsLink ? teamAnalyticsLink : `#`,
      accessibleBy: ["platformAdmin", "teamEditor", "analyst"],
      disabled: !teamAnalyticsLink,
    },
  ];

  const flowLayoutRoutes: Route[] = [
    {
      title: "Editor",
      Icon: EditorIcon,
      route: `/${teamSlug}/${flowSlug}`,
      accessibleBy: "*",
    },
    {
      title: "Flow settings",
      Icon: TuneIcon,
      route: `/${teamSlug}/${flowSlug}/settings`,
      accessibleBy: ["platformAdmin", "teamEditor", "demoUser"],
    },
    {
      title: "Feedback",
      Icon: RateReviewIcon,
      route: `/${teamSlug}/${flowSlug}/feedback`,
      accessibleBy: ["platformAdmin", "teamEditor", "demoUser"],
    },
    {
      title: "Submissions",
      Icon: FactCheckIcon,
      route: `/${teamSlug}/${flowSlug}/submissions`,
      accessibleBy: ["platformAdmin", "teamEditor", "demoUser"],
    },
    {
      title: flowAnalyticsLink
        ? `Analytics (external link)`
        : `Analytics page unavailable`,
      Icon: LeaderboardIcon,
      route: flowAnalyticsLink ? flowAnalyticsLink : `#`,
      accessibleBy: ["platformAdmin", "teamEditor", "demoUser", "analyst"],
      disabled: !flowAnalyticsLink,
    },
  ];

  const defaultRoutes: RoutesForURL = {
    routes: globalLayoutRoutes,
    compact: false,
  };
  const previousRoutes = useRef<RoutesForURL>(defaultRoutes);

  const getRoutesForUrl = (url: string): RoutesForURL => {
    // Return the previous value when route is loading to avoid flash of incorrect version
    if (router.state.isLoading) return previousRoutes.current;

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

  const { routes, compact } = getRoutesForUrl(pathname);

  const isRouteAccessible = ({ accessibleBy }: Route) => {
    const accessibleByAll = accessibleBy === "*";
    if (accessibleByAll) return true;

    const accessibleByCurrentUserRole = role && accessibleBy.includes(role);
    return accessibleByCurrentUserRole;
  };

  const setIsNavMenuVisible = useStore((state) => state.setIsNavMenuVisible);

  const visibleRoutes = routes.filter(isRouteAccessible);

  React.useEffect(() => {
    setIsNavMenuVisible(visibleRoutes.length >= 2);
  }, [visibleRoutes.length, setIsNavMenuVisible]);

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
                <MenuTitle variant="body3" pt={0.15}>
                  {title}
                </MenuTitle>
              </MenuButton>
            )}
          </MenuItem>
        ))}
      </MenuWrap>
    </Root>
  );
}

export default EditorNavMenu;
