import Edit from "@mui/icons-material/Edit";
import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import Person from "@mui/icons-material/Person";
import Visibility from "@mui/icons-material/Visibility";
import AppBar from "@mui/material/AppBar";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import { grey } from "@mui/material/colors";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import Link from "@mui/material/Link";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Popover, { popoverClasses } from "@mui/material/Popover";
import { styled, Theme } from "@mui/material/styles";
import MuiToolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import { clearLocalFlow } from "lib/local";
import { capitalize } from "lodash";
import { Route } from "navi";
import { useAnalyticsTracking } from "pages/FlowEditor/lib/analytics/provider";
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
import Permission from "ui/editor/Permission";
import Reset from "ui/icons/Reset";

import { useStore } from "../pages/FlowEditor/lib/store";
import { rootFlowPath } from "../routes/utils";
import AnalyticsDisabledBanner from "./AnalyticsDisabledBanner";
import { ConfirmationDialog } from "./ConfirmationDialog";
import TestEnvironmentBanner from "./TestEnvironmentBanner";

export const HEADER_HEIGHT = 74;

const Root = styled(AppBar)(({ theme }) => ({
  color: theme.palette.common.white,
}));

const BreadcrumbsRoot = styled(Box)(() => ({
  cursor: "pointer",
  fontSize: 20,
  display: "flex",
  columnGap: 10,
  alignItems: "center",
}));

const BreadcrumbsLink = styled(Link)(({ theme }) => ({
  color: theme.palette.common.white,
  textDecoration: "none",
  borderBottom: "1px solid rgba(255, 255, 255, 0.75)",
})) as typeof Link;

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

const StyledPopover = styled(Popover)(({ theme }) => ({
  [`& .${popoverClasses.paper}`]: {
    boxShadow: "4px 4px 0px rgba(150, 150, 150, 0.5)",
    backgroundColor: theme.palette.background.dark,
    borderRadius: 0,
  },
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.background.dark,
  color: theme.palette.common.white,
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
  backgroundColor: theme.palette.background.dark,
  color: theme.palette.common.white,
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
  const logo = <Logo alt={altText} src={teamTheme?.logo ?? undefined} />;
  return teamSettings?.homepage ? (
    <LogoLink href={teamSettings?.homepage} target="_blank">
      {logo}
    </LogoLink>
  ) : (
    logo
  );
};

const Breadcrumbs: React.FC = () => {
  const route = useCurrentRoute();
  const [team, isStandalone] = useStore((state) => [
    state.getTeam(),
    state.previewEnvironment === "standalone",
  ]);

  return (
    <BreadcrumbsRoot>
      <BreadcrumbsLink
        component={ReactNaviLink}
        href={"/"}
        prefetch={false}
        {...(isStandalone && { target: "_blank" })}
      >
        Plan✕
      </BreadcrumbsLink>
      {team.slug && (
        <>
          {" / "}
          <BreadcrumbsLink
            component={ReactNaviLink}
            href={`/${team.slug}`}
            prefetch={false}
            {...(isStandalone && { target: "_blank" })}
          >
            {team.slug}
          </BreadcrumbsLink>
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
          {useStore.getState().canUserEditTeam(team.slug) ? (
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
  const [index, sectionCount, title, hasSections, saveToEmail, path, node] =
    useStore((state) => [
      state.currentSectionIndex,
      state.sectionCount,
      state.currentSectionTitle,
      state.hasSections,
      state.saveToEmail,
      state.path,
      state.currentCard,
    ]);
  const isSaveAndReturnLandingPage =
    path !== ApplicationPath.SingleSession && !saveToEmail;
  const isContentPage = useCurrentRoute()?.data?.isContentPage;
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

  const { trackEvent } = useAnalyticsTracking();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const openConfirmationDialog = () => setIsDialogOpen(true);

  const handleRestart = (isConfirmed: boolean) => {
    setIsDialogOpen(false);
    if (isConfirmed) {
      trackEvent({
        event: "flowDirectionChange",
        metadata: null,
        flowDirection: "reset",
      });
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
              {teamTheme?.logo ? <TeamLogo /> : <Breadcrumbs />}
            </LeftBox>
            {showCentredServiceTitle && <ServiceTitle />}
            <RightBox>
              {showResetButton && (
                <IconButton
                  color="secondary"
                  onClick={openConfirmationDialog}
                  aria-label="Restart Application"
                  size="large"
                  aria-describedby="restart-application-description"
                >
                  <Reset color="secondary" />
                  <Typography
                    id="restart-application-description"
                    variant="body2"
                    fontSize="small"
                    fontWeight={FONT_WEIGHT_SEMI_BOLD}
                    pl={0.5}
                  >
                    Restart
                  </Typography>
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
      <ConfirmationDialog
        open={isDialogOpen}
        onClose={handleRestart}
        title="Confirm"
        confirmText="Yes"
        cancelText="No"
      >
        <Typography>
          Are you sure you want to restart? This will delete your previous
          answers
        </Typography>
      </ConfirmationDialog>
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
  const { navigate } = useNavigation();
  const [open, setOpen] = useState(false);
  const [togglePreview, user, team, canUserEditTeam] = useStore((state) => [
    state.togglePreview,
    state.getUser(),
    state.getTeam(),
    state.canUserEditTeam,
  ]);

  const handleClose = () => {
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
              <Breadcrumbs />
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
                  <Box mr={1}></Box>
                  <IconButton
                    edge="end"
                    color="inherit"
                    aria-label="Toggle Menu"
                    onClick={handleMenuToggle}
                    size="large"
                  >
                    <Avatar
                      component="span"
                      sx={{
                        bgcolor: grey[200],
                        color: "text.primary",
                        fontSize: "1rem",
                        fontWeight: FONT_WEIGHT_SEMI_BOLD,
                        width: 33,
                        height: 33,
                        marginRight: "0.5rem",
                      }}
                    >
                      {user.firstName[0]}
                      {user.lastName[0]}
                    </Avatar>
                    <Typography variant="body2" fontSize="small">
                      Account
                    </Typography>
                    <KeyboardArrowDown />
                  </IconButton>
                </ProfileSection>
              )}
            </RightBox>
          </InnerContainer>
        </Container>
      </StyledToolbar>
      <TestEnvironmentBanner />
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
  if (
    previewEnvironment === "editor" &&
    path !== "draft" &&
    path !== "preview"
  ) {
    return <EditorToolbar headerRef={headerRef} route={route}></EditorToolbar>;
  }

  switch (path) {
    case flowSlug: // Custom domains
    case "published":
    case "preview":
    case "draft":
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
      style={{ backgroundColor: theme?.primaryColour || "#2c2c2c" }}
    >
      <Toolbar headerRef={headerRef}></Toolbar>
    </Root>
  );
};

export default Header;
