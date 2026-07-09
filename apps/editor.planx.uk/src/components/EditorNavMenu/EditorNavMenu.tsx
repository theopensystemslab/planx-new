import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import CurrencyPoundIcon from "@mui/icons-material/CurrencyPound";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ExploreIcon from "@mui/icons-material/Explore";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import FlagIcon from "@mui/icons-material/Flag";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import GroupIcon from "@mui/icons-material/Group";
import LayersIcon from "@mui/icons-material/Layers";
import LeaderboardIcon from "@mui/icons-material/Leaderboard";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import RateReviewIcon from "@mui/icons-material/RateReview";
import SchoolIcon from "@mui/icons-material/School";
import TuneIcon from "@mui/icons-material/Tune";
import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import {
  useLocation,
  useMatches,
  useNavigate,
  useParams,
} from "@tanstack/react-router";
import AccountMenu from "components/AccountMenu";
import { useFlowAnalyticsLink } from "hooks/analyticsLinks/useFlowAnalyticsLink";
import { useTeamAnalyticsLink } from "hooks/analyticsLinks/useTeamAnalyticsLink";
import { AVAILABLE_FEATURE_FLAGS, hasFeatureFlag } from "lib/featureFlags";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useMemo, useRef, useState } from "react";
import EditorIcon from "ui/icons/Editor";
import LocalPlanningServicesIcon from "ui/icons/LocalPlanningServices";

import { useNotificationsCount } from "../../hooks/data/useNotificationsCount";
import { useRecentNotifications } from "../../hooks/data/useRecentNotifications";
import { useLPS } from "../../hooks/useLPS";
import AccordionItemButton from "./components/AccordionItemButton";
import AccordionToggle from "./components/AccordionToggle";
import FeatureFlagsPanel from "./components/FeatureFlagsPanel";
import NavMenuHeader from "./components/NavMenuHeader";
import NavMenuItem from "./components/NavMenuItem";
import NotificationsPanel from "./components/NotificationsPanel";
import { TeamSelect } from "./components/TeamSelect";
import {
  AccordionContent,
  MenuItem,
  MenuWrap,
  NavBarContainer,
  Root,
  Subtitle,
} from "./styles";
import type { MenuSection, Route } from "./types";

function EditorNavMenu() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { team: teamSlug, flow: flowSlug } = useParams({ strict: false });

  // Check route via matches to decide which mode menu items to display
  const matches = useMatches();
  const isFlowRoute = matches.some((match) => match.routeId.includes("$flow"));
  const isTeamRoute = matches.some((match) => match.routeId.includes("$team"));

  const [openAccordions, setOpenAccordions] = useState<Set<string>>(new Set());
  const [notificationsPanelOpen, setNotificationsPanelOpen] = useState(false);
  const [featureFlagsPanelOpen, setFeatureFlagsPanelOpen] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const featureFlagsRef = useRef<HTMLDivElement>(null);

  const [role, team] = useStore((state) => [
    state.getUserRoleForCurrentTeam(),
    state.getTeam(),
  ]);

  const referenceCode = team?.settings?.referenceCode;
  const { url: lpsBaseUrl } = useLPS();

  const isActive = (route: string) => {
    const currentPath = pathname;

    // Factor in nested routes when determining active state
    if (route.includes("settings")) {
      return currentPath.startsWith(route);
    }

    return currentPath.endsWith(route);
  };

  const isExternalLink = (route: string) =>
    route.startsWith("http://") || route.startsWith("https://");

  const handleClick = (route: string, disabled?: boolean) => {
    if (isActive(route) || disabled) return;
    if (isExternalLink(route)) {
      window.open(route, "_blank");
    } else {
      navigate({ to: route });
    }
  };

  const teamAnalyticsLink = useTeamAnalyticsLink();
  const flowAnalyticsLink = useFlowAnalyticsLink();
  const notificationsCount = useNotificationsCount();
  const { active: activeNotifications, resolved: resolvedNotifications } =
    useRecentNotifications();

  const globalLayoutSections: MenuSection[] = [
    {
      routes: [
        {
          title: "Select a team",
          Icon: FormatListBulletedIcon,
          route: "/app",
          accessibleBy: "*",
        },
        {
          title: "Global settings",
          Icon: TuneIcon,
          route: "/app/global-settings",
          accessibleBy: ["platformAdmin"],
        },
        {
          title: "Admin panel",
          Icon: AdminPanelSettingsIcon,
          route: "/app/admin-panel",
          accessibleBy: ["platformAdmin", "analyst"],
        },
        {
          title: "User management",
          Icon: GroupIcon,
          route: `/app/users`,
          accessibleBy: ["platformAdmin"],
        },
      ],
    },
  ];

  const teamLayoutSections: MenuSection[] = useMemo(
    () => [
      {
        routes: [
          {
            title: "Dashboard",
            Icon: DashboardIcon,
            route: `/app/${teamSlug}/dashboard`,
            accessibleBy: "*" as const,
          },
          {
            title: "Flows",
            Icon: EditorIcon,
            route: `/app/${teamSlug}/flows`,
            accessibleBy: "*" as const,
          },
          ...(hasFeatureFlag("EXPLORE")
            ? [
                {
                  title: "Explore",
                  Icon: ExploreIcon,
                  route: `/app/explore`,
                  accessibleBy: "*" as const,
                },
              ]
            : []),
        ],
      },
      {
        subtitle: "Settings",
        accordion: true,
        routes: [
          {
            title: "Team settings",
            Icon: TuneIcon,
            route: `/app/${teamSlug}/settings`,
            accessibleBy: ["platformAdmin", "teamAdmin", "teamEditor"],
          },
          {
            title: "Team members",
            Icon: GroupIcon,
            route: `/app/${teamSlug}/members`,
            accessibleBy: ["platformAdmin", "teamAdmin", "teamEditor"],
          },
          {
            title: "Subscription",
            Icon: CurrencyPoundIcon,
            route: `/app/${teamSlug}/subscription`,
            accessibleBy: ["platformAdmin", "teamAdmin"],
            isNew: true,
          },
        ],
      },
      {
        subtitle: "Data",
        accordion: true,
        icon: LeaderboardIcon,
        routes: [
          {
            title: "Submissions",
            Icon: FactCheckIcon,
            route: `/app/${teamSlug}/submissions`,
            accessibleBy: ["platformAdmin", "teamAdmin", "teamEditor"],
          },
          {
            title: "Feedback",
            Icon: RateReviewIcon,
            route: `/app/${teamSlug}/feedback`,
            accessibleBy: ["platformAdmin", "teamAdmin", "teamEditor"],
          },
          {
            title: "Analytics",
            Icon: LeaderboardIcon,
            route: teamAnalyticsLink ? teamAnalyticsLink : `#`,
            accessibleBy: "*",
            disabled: !teamAnalyticsLink,
          },
          {
            title: "Planning Data",
            Icon: LayersIcon,
            route: referenceCode
              ? `https://submit.planning.data.gov.uk/organisations/local-authority:${referenceCode}`
              : `#`,
            accessibleBy: "*",
            disabled: !referenceCode,
          },
          {
            title: "Local Planning Services",
            Icon: LocalPlanningServicesIcon,
            route: referenceCode ? `${lpsBaseUrl}/${teamSlug}` : `#`,
            accessibleBy: "*",
            disabled: !referenceCode,
          },
        ],
      },
      {
        subtitle: "Documentation",
        accordion: true,
        routes: [
          {
            title: "Resources",
            Icon: MenuBookIcon,
            route: `/app/${teamSlug}/resources`,
            accessibleBy: "*",
          },
          {
            title: "Onboarding",
            Icon: AssignmentTurnedInIcon,
            route: `/app/${teamSlug}/onboarding`,
            accessibleBy: "*",
          },
          {
            title: "Tutorials",
            Icon: SchoolIcon,
            route: `/app/${teamSlug}/tutorials`,
            accessibleBy: "*",
          },
        ],
      },
    ],
    [teamSlug, lpsBaseUrl, referenceCode, teamAnalyticsLink],
  );

  const flowLayoutSections: MenuSection[] = useMemo(
    () => [
      {
        routes: [
          {
            title: "Editor",
            Icon: EditorIcon,
            route: `/app/${teamSlug}/${flowSlug}`,
            accessibleBy: "*",
          },
          {
            title: "Flow settings",
            Icon: TuneIcon,
            route: `/app/${teamSlug}/${flowSlug}/settings`,
            accessibleBy: ["platformAdmin", "teamAdmin", "teamEditor"],
          },
          {
            title: "Feedback",
            Icon: RateReviewIcon,
            route: `/app/${teamSlug}/${flowSlug}/feedback`,
            accessibleBy: ["platformAdmin", "teamAdmin", "teamEditor"],
          },
          {
            title: "Submissions",
            Icon: FactCheckIcon,
            route: `/app/${teamSlug}/${flowSlug}/submissions`,
            accessibleBy: ["platformAdmin", "teamAdmin", "teamEditor"],
          },
          {
            title: "Analytics",
            Icon: LeaderboardIcon,
            route: flowAnalyticsLink ? flowAnalyticsLink : `#`,
            accessibleBy: "*",
            disabled: !flowAnalyticsLink,
          },
        ],
      },
    ],
    [teamSlug, flowSlug, flowAnalyticsLink],
  );

  const getRoutesForUrl = (): { sections: MenuSection[]; compact: boolean } => {
    if (isFlowRoute) return { sections: flowLayoutSections, compact: true };
    if (isTeamRoute) return { sections: teamLayoutSections, compact: false };
    return { sections: globalLayoutSections, compact: false };
  };

  const { sections, compact } = getRoutesForUrl();

  const totalFlagCount = AVAILABLE_FEATURE_FLAGS.length;
  const enabledFlagCount =
    AVAILABLE_FEATURE_FLAGS.filter(hasFeatureFlag).length;
  const featureFlagBadge =
    totalFlagCount > 0
      ? {
          badgeCount: `${enabledFlagCount}/${totalFlagCount}`,
          badgeColor:
            enabledFlagCount > 0 ? ("info" as const) : ("default" as const),
        }
      : {};

  const isRouteAccessible = ({ accessibleBy }: Route) => {
    const accessibleByAll = accessibleBy === "*";
    if (accessibleByAll) return true;

    const accessibleByCurrentUserRole = role && accessibleBy.includes(role);
    return accessibleByCurrentUserRole;
  };

  // Filter accessible routes within each section
  const visibleSections = sections
    .map((section) => ({
      ...section,
      routes: section.routes.filter(isRouteAccessible),
    }))
    .filter((section) => section.routes.length > 0);

  const toggleAccordion = (subtitle: string) => {
    setOpenAccordions((prev) => {
      const next = new Set(prev);
      if (next.has(subtitle)) {
        next.delete(subtitle);
      } else {
        next.add(subtitle);
      }
      return next;
    });
  };

  return (
    <Root compact={compact}>
      <NavBarContainer>
        <NavMenuHeader compact={compact} />
        {teamSlug && !compact && (
          <Box sx={(theme) => ({ padding: theme.spacing(1, 0.5, 0, 0.5) })}>
            <TeamSelect
              currentTeamSlug={teamSlug}
              onTeamSelect={(slug) =>
                navigate({ to: "/app/$team", params: { team: slug } })
              }
            />
          </Box>
        )}
        <MenuWrap>
          {visibleSections.map((section, sectionIndex) => {
            if (section.accordion && section.subtitle) {
              const FirstIcon = section.icon ?? section.routes[0].Icon;
              const isOpen = openAccordions.has(section.subtitle);
              return (
                <MenuItem key={sectionIndex}>
                  <AccordionToggle
                    subtitle={section.subtitle}
                    Icon={FirstIcon}
                    isOpen={isOpen}
                    onToggle={() => toggleAccordion(section.subtitle!)}
                  />
                  <Collapse in={isOpen}>
                    <AccordionContent>
                      {section.routes.map(
                        ({ title, route, disabled, isNew }) => (
                          <MenuItem key={title}>
                            <AccordionItemButton
                              title={title}
                              disabled={disabled}
                              isNew={isNew}
                              isActive={isActive(route)}
                              isExternal={isExternalLink(route)}
                              onClick={() => handleClick(route, disabled)}
                            />
                          </MenuItem>
                        ),
                      )}
                    </AccordionContent>
                  </Collapse>
                </MenuItem>
              );
            }

            return (
              <React.Fragment key={sectionIndex}>
                {section.subtitle && (
                  <Subtitle variant="body3">{section.subtitle}</Subtitle>
                )}
                {section.routes.map(
                  ({ title, Icon, route, disabled, isNew }) => (
                    <MenuItem key={title}>
                      <NavMenuItem
                        title={title}
                        Icon={Icon}
                        disabled={disabled}
                        isNew={isNew}
                        isActive={isActive(route)}
                        isExternal={isExternalLink(route)}
                        compact={compact}
                        onClick={() => handleClick(route, disabled)}
                      />
                    </MenuItem>
                  ),
                )}
              </React.Fragment>
            );
          })}
        </MenuWrap>
        <Box
          sx={(theme) => ({
            padding: theme.spacing(0, 0.5, 1),
            gap: theme.spacing(0.5),
            display: "flex",
            flexDirection: "column",
          })}
        >
          {role === "platformAdmin" && (
            <>
              <Box ref={featureFlagsRef}>
                <NavMenuItem
                  title="Feature flags"
                  Icon={FlagIcon}
                  {...featureFlagBadge}
                  isActive={featureFlagsPanelOpen}
                  isExternal={false}
                  compact={compact}
                  onClick={() => setFeatureFlagsPanelOpen((prev) => !prev)}
                  sx={{ minHeight: 44 }}
                />
              </Box>
              <FeatureFlagsPanel
                anchorEl={
                  featureFlagsPanelOpen ? featureFlagsRef.current : null
                }
                onClose={() => setFeatureFlagsPanelOpen(false)}
              />
            </>
          )}
          {isTeamRoute &&
            (role === "platformAdmin" || role === "teamEditor") && (
              <>
                <Box ref={notificationsRef}>
                  <NavMenuItem
                    title="Notifications"
                    Icon={NotificationsActiveIcon}
                    badgeCount={notificationsCount || undefined}
                    isActive={notificationsPanelOpen}
                    isExternal={false}
                    compact={compact}
                    onClick={() => setNotificationsPanelOpen((prev) => !prev)}
                    sx={{ minHeight: 44 }}
                  />
                </Box>
                <NotificationsPanel
                  anchorEl={
                    notificationsPanelOpen ? notificationsRef.current : null
                  }
                  onClose={() => setNotificationsPanelOpen(false)}
                  activeNotifications={activeNotifications}
                  resolvedNotifications={resolvedNotifications}
                  teamSlug={teamSlug!}
                />
              </>
            )}
        </Box>
        <AccountMenu compact={compact} />
      </NavBarContainer>
    </Root>
  );
}

export default EditorNavMenu;
