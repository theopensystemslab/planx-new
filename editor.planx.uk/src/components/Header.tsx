import Edit from "@mui/icons-material/Edit";
import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import Person from "@mui/icons-material/Person";
import Visibility from "@mui/icons-material/Visibility";
import AppBar from "@mui/material/AppBar";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import Link from "@mui/material/Link";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Popover from "@mui/material/Popover";
import { styled, Theme } from "@mui/material/styles";
import MuiToolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import { TYPES } from "@planx/components/types";
import { hasFeatureFlag } from "lib/featureFlags";
import { clearLocalFlow } from "lib/local";
import { capitalize } from "lodash";
import { Route } from "navi";
import { useAnalyticsTracking } from "pages/FlowEditor/lib/analyticsProvider";
import React, { RefObject, useRef, useState } from "react";
import {
  Link as ReactNaviLink,
  useCurrentRoute,
  useNavigation,
} from "react-navi";
import {
  borderedFocusStyle,
  focusStyle,
  FONT_WEIGHT_SEMI_BOLD,
  LINE_HEIGHT_BASE,
} from "theme";
import { ApplicationPath } from "types";
import Reset from "ui/icons/Reset";

import { useStore } from "../pages/FlowEditor/lib/store";
import { rootFlowPath } from "../routes/utils";
import AnalyticsDisabledBanner from "./AnalyticsDisabledBanner";
import TestEnvironmentBanner from "./TestEnvironmentBanner";

export const HEADER_HEIGHT = 74;

const Root = styled(AppBar)(() => ({
  color: "#fff",
}));

const BreadcrumbsRoot = styled(Box)(() => ({
  cursor: "pointer",
  fontSize: 20,
  display: "flex",
  columnGap: 10,
  alignItems: "center",
}));

const StyledToolbar = styled(MuiToolbar)(() => ({
  height: HEADER_HEIGHT,
}));

const InnerContainer = styled(Box)(() => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
}));

const LeftBox = styled(Box)(() => ({
  display: "flex",
  flexGrow: 1,
  flexShrink: 0,
  flexBasis: "140px",
  justifyContent: "start",
}));

const RightBox = styled(Box)(() => ({
  display: "flex",
  flexGrow: 0,
  flexShrink: 0,
  flexBasis: "140px",
  justifyContent: "end",
}));

const ProfileSection = styled(MuiToolbar)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginRight: theme.spacing(1),
}));

const StyledPopover = styled(Popover)(() => ({
  ["& .MuiPopover-paper"]: {
    boxShadow: "4px 4px 0px rgba(150, 150, 150, 0.5)",
    backgroundColor: "#2c2c2c",
    borderRadius: 0,
  },
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  backgroundColor: "#2c2c2c",
  color: "#fff",
  borderRadius: 0,
  boxShadow: "none",
  minWidth: 180,
  "& li": {
    padding: theme.spacing(1.5, 2),
  },
}));

const Logo = styled("img")(() => ({
  height: HEADER_HEIGHT - 5,
  width: "100%",
  maxWidth: 140,
  maxHeight: HEADER_HEIGHT - 20,
  objectFit: "contain",
}));

const LogoLink = styled(Link)(() => ({
  display: "flex",
  alignItems: "center",
  "&:focus-visible": borderedFocusStyle,
}));

const SkipLink = styled("a")(({ theme }) => ({
  tabIndex: 0,
  width: "100vw",
  height: HEADER_HEIGHT / 2,
  backgroundColor: "#2c2c2c",
  color: "#fff",
  textDecoration: "underline",
  padding: theme.spacing(1),
  paddingLeft: theme.spacing(3),
  // translate off-screen with absolute position
  position: "absolute",
  transform: "translateY(-100%)",
  "&:focus": {
    // bring it into view when accessed by tab
    transform: "translateY(0%)",
    position: "relative",
    ...focusStyle,
  },
}));

const ServiceTitleRoot = styled("span")(({ theme }) => ({
  display: "flex",
  flexGrow: 1,
  flexShrink: 1,
  lineHeight: LINE_HEIGHT_BASE,
  fontWeight: FONT_WEIGHT_SEMI_BOLD,
  paddingBottom: theme.spacing(1.5),
  [theme.breakpoints.up("md")]: {
    paddingBottom: 0,
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
  },
}));

const StyledNavBar = styled("nav")(({ theme }) => ({
  backgroundColor: theme.palette.primary.dark,
  fontSize: 16,
}));

const SectionName = styled(Typography)(() => ({
  fontSize: "inherit",
  fontWeight: FONT_WEIGHT_SEMI_BOLD,
}));

const SectionCount = styled(Typography)(() => ({
  fontSize: "inherit",
}));

const TeamLogo: React.FC = () => {
  const [teamSettings, teamName, teamTheme] = useStore((state) => [
    state.teamSettings,
    state.teamName,
    state.teamTheme,
  ]);

  const altText = teamSettings?.homepage
    ? `${teamName} Homepage (opens in a new tab)`
    : `${teamName} Logo`;
  const logo = <Logo alt={altText} src={teamTheme?.logo} />;
  return teamSettings?.homepage ? (
    <LogoLink href={teamSettings?.homepage} target="_blank">
      {logo}
    </LogoLink>
  ) : (
    logo
  );
};

const Breadcrumbs: React.FC<{
  handleClick?: (href: string) => void;
}> = ({ handleClick }) => {
  const route = useCurrentRoute();
  const team = useStore((state) => state.getTeam());

  return (
    <BreadcrumbsRoot>
      <ButtonBase
        component="span"
        color="#999"
        onClick={() => handleClick && handleClick("/")}
      >
        Plan✕
      </ButtonBase>

      {team && (
        <>
          {" / "}
          <Link
            style={{
              color: "#fff",
              textDecoration: "none",
            }}
            component={ReactNaviLink}
            href={`/${team.slug}`}
            prefetch={false}
          >
            {team.slug}
          </Link>
        </>
      )}
      {route.data.flow && (
        <>
          {" / "}
          <Link
            style={{
              color: "#fff",
              textDecoration: "none",
            }}
            component={ReactNaviLink}
            href={rootFlowPath(false)}
            prefetch={false}
          >
            {route.data.flow}
          </Link>
        </>
      )}
      {route.data.flow && (
        <>
          {useStore.getState().canUserEditTeam(route.data.team) ? (
            <Edit />
          ) : (
            <Visibility />
          )}
        </>
      )}
    </BreadcrumbsRoot>
  );
};

const NavBar: React.FC = () => {
  const [index, sectionCount, title, hasSections, saveToEmail, path] = useStore(
    (state) => [
      state.currentSectionIndex,
      state.sectionCount,
      state.currentSectionTitle,
      state.hasSections,
      state.saveToEmail,
      state.path,
    ],
  );
  const isSaveAndReturnLandingPage =
    path !== ApplicationPath.SingleSession &&
    !saveToEmail &&
    !hasFeatureFlag("DISABLE_SAVE_AND_RETURN");
  const isContentPage = useCurrentRoute()?.data?.isContentPage;
  const { node } = useAnalyticsTracking();
  const isSectionCard = node?.type == TYPES.Section;
  const isVisible =
    hasSections &&
    !isSaveAndReturnLandingPage &&
    !isContentPage &&
    !isSectionCard;

  return (
    <>
      {isVisible && (
        <StyledNavBar data-testid="navigation-bar">
          <Container
            maxWidth={false}
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              minHeight: HEADER_HEIGHT,
            }}
          >
            <SectionCount>{`Section ${index} of ${sectionCount}`}</SectionCount>
            <SectionName>{capitalize(title)}</SectionName>
          </Container>
        </StyledNavBar>
      )}
    </>
  );
};

const PublicToolbar: React.FC<{
  showResetButton?: boolean;
}> = ({ showResetButton = true }) => {
  const { navigate } = useNavigation();
  const [path, id, teamTheme] = useStore((state) => [
    state.path,
    state.id,
    state.teamTheme,
  ]);

  // Center the service title on desktop layouts, or drop it to second line on mobile
  // ref https://design-system.service.gov.uk/styles/page-template/
  const showCentredServiceTitle = useMediaQuery((theme: Theme) =>
    theme.breakpoints.up("md"),
  );

  const handleRestart = async () => {
    if (
      confirm(
        "Are you sure you want to restart? This will delete your previous answers",
      )
    ) {
      if (path === ApplicationPath.SingleSession) {
        clearLocalFlow(id);
        window.location.reload();
      } else {
        // Save & Return flow
        // don't delete old flow for now
        // await NEW_LOCAL.clearLocalFlow(sessionId)
        const url = new URL(window.location.href);
        url.searchParams.delete("sessionId");
        window.location.href = url.href;
      }
    }
  };

  return (
    <>
      <SkipLink href="#main-content">Skip to main content</SkipLink>
      <StyledToolbar disableGutters>
        <Container maxWidth={false}>
          <InnerContainer>
            <LeftBox>
              {teamTheme?.logo ? (
                <TeamLogo />
              ) : (
                <Breadcrumbs handleClick={navigate} />
              )}
            </LeftBox>
            {showCentredServiceTitle && <ServiceTitle />}
            <RightBox>
              {showResetButton && (
                <IconButton
                  color="secondary"
                  onClick={handleRestart}
                  aria-label="Restart Application"
                  size="large"
                >
                  <Reset color="secondary" />
                </IconButton>
              )}
            </RightBox>
          </InnerContainer>
        </Container>
      </StyledToolbar>
      {!showCentredServiceTitle && (
        <Container maxWidth={false}>
          <ServiceTitle />
        </Container>
      )}
      <NavBar />
      <AnalyticsDisabledBanner />
      <TestEnvironmentBanner />
    </>
  );
};

const ServiceTitle: React.FC = () => {
  const flowName = useStore((state) => state.flowName);

  return (
    <ServiceTitleRoot data-testid="service-title">
      <Typography component="span" variant="h4">
        {flowName}
      </Typography>
    </ServiceTitleRoot>
  );
};

const EditorToolbar: React.FC<{
  headerRef: React.RefObject<HTMLElement>;
  route: Route;
}> = ({ headerRef, route }) => {
  const [open, setOpen] = useState(false);
  const [togglePreview, user] = useStore((state) => [
    state.togglePreview,
    state.getUser(),
  ]);

  const { navigate } = useNavigation();

  const handleClose = () => {
    setOpen(false);
  };

  const handleClick = (href?: string) => {
    if (href) navigate(href);
    setOpen(false);
  };

  const handleMenuToggle = () => {
    setOpen(!open);
  };

  return (
    <>
      <StyledToolbar disableGutters>
        <Container maxWidth={false}>
          <InnerContainer>
            <LeftBox>
              <Breadcrumbs handleClick={handleClick}></Breadcrumbs>
            </LeftBox>
            <RightBox>
              {user && (
                <ProfileSection disableGutters>
                  {route.data.flow && (
                    <IconButton
                      color="inherit"
                      onClick={togglePreview}
                      aria-label="Toggle Preview"
                      size="large"
                    >
                      <MenuOpenIcon />
                    </IconButton>
                  )}
                  <Box mr={1}>
                    <Avatar>{user.firstName[0]}</Avatar>
                  </Box>
                  <IconButton
                    edge="end"
                    color="inherit"
                    aria-label="Toggle Menu"
                    onClick={handleMenuToggle}
                    size="large"
                  >
                    <KeyboardArrowDown />
                  </IconButton>
                </ProfileSection>
              )}
            </RightBox>
          </InnerContainer>
        </Container>
      </StyledToolbar>
      {user && (
        <StyledPopover
          open={open}
          anchorEl={headerRef.current}
          onClose={handleClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
        >
          <StyledPaper>
            <MenuItem disabled>
              <ListItemIcon>
                <Person fontSize="small" />
              </ListItemIcon>
              <ListItemText>{user.email}</ListItemText>
            </MenuItem>
            {(user.isPlatformAdmin || user.teams.length > 0) && (
              <MenuItem disabled>
                <ListItemIcon>
                  <Edit />
                </ListItemIcon>
                <ListItemText>
                  {user.isPlatformAdmin
                    ? `All teams`
                    : user.teams
                        .map((team) => team.team.name)
                        .join(", ")}
                </ListItemText>
              </MenuItem>
            )}
            {!user.isPlatformAdmin && (
              <MenuItem disabled divider>
                <ListItemIcon>
                  <Visibility />
                </ListItemIcon>
                <ListItemText>All teams</ListItemText>
              </MenuItem>
            )}

            {/* only show flow settings link if inside a flow route  */}
            {route.data.flow && (
              <MenuItem
                onClick={() =>
                  handleClick([rootFlowPath(true), "settings"].join("/"))
                }
              >
                Settings
              </MenuItem>
            )}

            {/* Only show global settings link from top-level admin view */}
            {!route.data.flow && !route.data.team && (
              <MenuItem onClick={() => navigate("/global-settings")}>
                Global Settings
              </MenuItem>
            )}

            <MenuItem onClick={() => navigate("/logout")}>Log out</MenuItem>
          </StyledPaper>
        </StyledPopover>
      )}
    </>
  );
};

interface ToolbarProps {
  headerRef: RefObject<HTMLDivElement>;
}

const Toolbar: React.FC<ToolbarProps> = ({ headerRef }) => {
  const route = useCurrentRoute();
  const path = route.url.pathname.split("/").slice(-1)[0] || undefined;
  const [flowSlug, previewEnvironment] = useStore((state) => [
    state.flowSlug,
    state.previewEnvironment,
  ]);

  // Editor and custom domains share a path, so we need to rely on previewEnvironment
  if (previewEnvironment === "editor" && path !== "unpublished") {
    return <EditorToolbar headerRef={headerRef} route={route}></EditorToolbar>;
  }

  switch (path) {
    case flowSlug: // Custom domains
    case "preview":
    case "unpublished":
    case "pay":
      return <PublicToolbar />;
    default:
      return <PublicToolbar showResetButton={false} />;
  }
};

const Header: React.FC = () => {
  const headerRef = useRef<HTMLDivElement>(null);
  const theme = useStore((state) => state.teamTheme);
  return (
    <Root
      position="static"
      elevation={0}
      color="transparent"
      ref={headerRef}
      style={{ backgroundColor: theme?.primary || "#2c2c2c" }}
    >
      <Toolbar headerRef={headerRef}></Toolbar>
    </Root>
  );
};

export default Header;
