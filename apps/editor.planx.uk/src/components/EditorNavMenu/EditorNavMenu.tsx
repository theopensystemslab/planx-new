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
import Collapse from "@mui/material/Collapse";
import {
  useLocation,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";
import AccountMenu from "components/AccountMenu";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useRef, useState } from "react";
import EditorIcon from "ui/icons/Editor";
import LocalPlanningServicesIcon from "ui/icons/LocalPlanningServices";

import { useLPS } from "../../hooks/useLPS";
import AccordionItemButton from "./components/AccordionItemButton";
import AccordionToggle from "./components/AccordionToggle";
import NavMenuHeader from "./components/NavMenuHeader";
import NavMenuItem from "./components/NavMenuItem";
import { TeamSelect } from "./components/TeamSelect";
import {
  AccordionContent,
  MenuItem,
  MenuWrap,
  NavBarContainer,
  Root,
  Subtitle,
} from "./styles";
import { MenuSection, Route, RoutesForURL } from "./types";

function EditorNavMenu() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isRouterLoading = useRouterState({ select: (s) => s.isLoading });
  const [openAccordions, setOpenAccordions] = useState<Set<string>>(new Set());
  const [teamSlug, flowSlug, flowAnalyticsLink, role, team] = useStore(
    (state) => [
      state.teamSlug,
      state.flowSlug,
      state.flowAnalyticsLink,
      state.getUserRoleForCurrentTeam(),
      state.getTeam(),
    ],
  );
  const environment = import.meta.env.VITE_APP_ENV;

  const teamAnalyticsLink =
    environment === "production"
      ? `https://metabase.editor.planx.uk/public/dashboard/74337c9d-389d-4cb1-a65a-ad7e16428abf?date=&tab=641-key-figures&team_slug=${teamSlug}`
      : undefined;

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
      ],
    },
  ];

  const teamLayoutSections: MenuSection[] = [
    {
      routes: [
        {
          title: "Flows",
          Icon: EditorIcon,
          route: `/app/${teamSlug}`,
          accessibleBy: "*",
        },
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
          accessibleBy: ["platformAdmin", "teamEditor"],
        },
        {
          title: "Team members",
          Icon: GroupIcon,
          route: `/app/${teamSlug}/members`,
          accessibleBy: ["platformAdmin", "teamEditor"],
        },
        {
          title: "Subscription",
          Icon: CurrencyPoundIcon,
          route: `/app/${teamSlug}/subscription`,
          accessibleBy: ["platformAdmin", "teamEditor"],
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
          accessibleBy: ["platformAdmin", "teamEditor"],
        },
        {
          title: "Feedback",
          Icon: RateReviewIcon,
          route: `/app/${teamSlug}/feedback`,
          accessibleBy: ["platformAdmin", "teamEditor"],
        },
        {
          title: "Analytics",
          Icon: LeaderboardIcon,
          route: teamAnalyticsLink ? teamAnalyticsLink : `#`,
          accessibleBy: ["platformAdmin", "teamEditor", "analyst"],
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
  ];

  const flowLayoutSections: MenuSection[] = [
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
          accessibleBy: ["platformAdmin", "teamEditor"],
        },
        {
          title: "Feedback",
          Icon: RateReviewIcon,
          route: `/app/${teamSlug}/${flowSlug}/feedback`,
          accessibleBy: ["platformAdmin", "teamEditor"],
        },
        {
          title: "Submissions",
          Icon: FactCheckIcon,
          route: `/app/${teamSlug}/${flowSlug}/submissions`,
          accessibleBy: ["platformAdmin", "teamEditor"],
        },
        {
          title: "Analytics",
          Icon: LeaderboardIcon,
          route: flowAnalyticsLink ? flowAnalyticsLink : `#`,
          accessibleBy: ["platformAdmin", "teamEditor", "analyst"],
          disabled: !flowAnalyticsLink,
        },
      ],
    },
  ];

  const defaultRoutesForURL: RoutesForURL = {
    sections: globalLayoutSections,
    compact: false,
  };
  const previousRoutes = useRef<RoutesForURL>(defaultRoutesForURL);

  const getRoutesForUrl = (url: string): RoutesForURL => {
    // Return the previous value when route is loading to avoid flash of incorrect version
    if (isRouterLoading) return previousRoutes.current;

    let result: RoutesForURL;

    if (flowSlug && url.includes(flowSlug)) {
      result = { sections: flowLayoutSections, compact: true };
    } else if (teamSlug && url.includes(teamSlug)) {
      result = { sections: teamLayoutSections, compact: false };
    } else {
      result = defaultRoutesForURL;
    }

    previousRoutes.current = result;

    return result;
  };

  const { sections, compact } = getRoutesForUrl(pathname);

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
        <AccountMenu compact={compact} />
      </NavBarContainer>
    </Root>
  );
}

export default EditorNavMenu;
