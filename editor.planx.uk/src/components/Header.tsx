import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import AppBar from "@mui/material/AppBar";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import IconButton from "@mui/material/IconButton";
import Link from "@mui/material/Link";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Popover from "@mui/material/Popover";
import MuiToolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import { styled } from "@mui/styles";
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
import { borderedFocusStyle, focusStyle } from "theme";
import { ApplicationPath, Team } from "types";
import Reset from "ui/icons/Reset";

import { useStore } from "../pages/FlowEditor/lib/store";
import { rootFlowPath } from "../routes/utils";
import AnalyticsDisabledBanner from "./AnalyticsDisabledBanner";

export const HEADER_HEIGHT = 74;

const Root = styled(AppBar)(() => ({
  color: "#fff",
}));

const BreadcrumbsRoot = styled(Box)(() => ({
  cursor: "pointer",
  fontSize: 20,
}));

const BreadcrumbLink = styled(ReactNaviLink)(() => ({
  color: "#fff",
  textDecoration: "none",
}));

const StyledToolbar = styled(MuiToolbar)(({ theme }) => ({
  paddingLeft: theme.spacing(4),
  paddingRight: theme.spacing(4),
  marginTop: theme.spacing(1),
  height: HEADER_HEIGHT,
  display: "flex",
  alignItems: "center",
}));

const LeftBox = styled(Box)(() => ({
  display: "flex",
  flex: 1,
  justifyContent: "start",
}));

const RightBox = styled(Box)(() => ({
  display: "flex",
  flex: 1,
  justifyContent: "end",
}));

const ProfileSection = styled(MuiToolbar)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginRight: theme.spacing(2),
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
  objectFit: "contain",
}));

const LogoLink = styled(Link)(() => ({
  display: "inline-block",
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
  fontSize: "1.25em",
  fontWeight: 700,
  paddingLeft: theme.spacing(2),
  paddingBottom: theme.spacing(1),
}));

const StyledNavBar = styled("nav")(({ theme }) => ({
  height: HEADER_HEIGHT,
  backgroundColor: theme.palette.primary.dark,
  padding: theme.spacing(1.5),
  paddingLeft: theme.spacing(4),
  fontSize: 16,
}));

const SectionName = styled(Typography)(() => ({
  fontSize: "inherit",
  fontWeight: "bold",
}));

const SectionCount = styled(Typography)(() => ({
  fontSize: "inherit",
}));

const TeamLogo: React.FC<{ team?: Team }> = ({ team }) => {
  const altText = team?.settings?.homepage
    ? `${team.name} Homepage (opens in a new tab)`
    : `${team?.name} Logo`;
  const logo = <Logo alt={altText} src={team?.theme?.logo} />;
  return team?.settings?.homepage ? (
    <LogoLink href={team.settings.homepage} target="_blank">
      {logo}
    </LogoLink>
  ) : (
    logo
  );
};

const Breadcrumbs: React.FC<{
  route: Route;
  handleClick?: (href: string) => void;
}> = ({ route, handleClick }) => (
  <BreadcrumbsRoot>
    <ButtonBase
      component="span"
      color="#999"
      onClick={() => handleClick && handleClick("/")}
    >
      Plan✕
    </ButtonBase>

    {route.data.team && (
      <>
        {" / "}
        <Link
          component={BreadcrumbLink}
          href={`/${route.data.team}`}
          prefetch={false}
        >
          {route.data.team}
        </Link>
      </>
    )}
    {route.data.flow && (
      <>
        {" / "}
        <Link
          component={BreadcrumbLink}
          href={rootFlowPath(false)}
          prefetch={false}
        >
          {route.data.flow}
        </Link>
      </>
    )}
  </BreadcrumbsRoot>
);

const NavBar: React.FC = () => {
  const [index, sectionCount, title, hasSections, saveToEmail, path] = useStore(
    (state) => [
      state.currentSectionIndex,
      state.sectionCount,
      state.currentSectionTitle,
      state.hasSections,
      state.saveToEmail,
      state.path,
    ]
  );
  const isSaveAndReturnLandingPage =
    path !== ApplicationPath.SingleSession &&
    !Boolean(saveToEmail) &&
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
          <SectionCount>{`Section ${index} of ${sectionCount}`}</SectionCount>
          <SectionName>{capitalize(title)}</SectionName>
        </StyledNavBar>
      )}
    </>
  );
};

const PublicToolbar: React.FC<{
  team?: Team;
  route: Route;
  showResetButton?: boolean;
}> = ({ team, route, showResetButton = true }) => {
  const { navigate } = useNavigation();
  const { path, id } = useStore();

  // Center the service title on desktop layouts, or drop it to second line on mobile
  // ref https://design-system.service.gov.uk/styles/page-template/
  const showCentredServiceTitle = useMediaQuery("(min-width:600px)");

  const handleRestart = async () => {
    if (
      confirm(
        "Are you sure you want to restart? This will delete your previous answers"
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
      <StyledToolbar>
        <LeftBox>
          {team?.theme?.logo ? (
            <TeamLogo team={team}></TeamLogo>
          ) : (
            <Breadcrumbs route={route} handleClick={navigate}></Breadcrumbs>
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
      </StyledToolbar>
      {!showCentredServiceTitle && <ServiceTitle />}
      <NavBar />
      <AnalyticsDisabledBanner />
    </>
  );
};

const ServiceTitle: React.FC = () => {
  const flowName = useStore((state) => state.flowName);

  return (
    <ServiceTitleRoot data-testid="service-title">{flowName}</ServiceTitleRoot>
  );
};

const EditorToolbar: React.FC<{
  headerRef: React.RefObject<HTMLElement>;
  route: Route;
}> = ({ headerRef, route }) => {
  const [open, setOpen] = useState(false);
  const togglePreview = useStore((state) => state.togglePreview);

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
      <StyledToolbar>
        <LeftBox>
          <Breadcrumbs route={route} handleClick={handleClick}></Breadcrumbs>
        </LeftBox>
        <RightBox>
          {route.data.username && (
            <ProfileSection>
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
                <Avatar>{route.data.username[0]}</Avatar>
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
      </StyledToolbar>
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
          {/*
          <MenuItem onClick={() => handleClick("/")}>Service settings</MenuItem>
          <MenuItem onClick={() => handleClick("/")}>My dashboard</MenuItem>
           */}

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
    </>
  );
};

interface ToolbarProps {
  headerRef: RefObject<HTMLDivElement>;
  team?: Team;
}

const Toolbar: React.FC<ToolbarProps> = ({ headerRef, team }) => {
  const route = useCurrentRoute();
  const path = route.url.pathname.split("/").slice(-1)[0];
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
      return <PublicToolbar team={team} route={route} />;
    default:
      return (
        <PublicToolbar team={team} route={route} showResetButton={false} />
      );
  }
};

const Header: React.FC<{
  bgcolor?: string;
  team?: Team;
}> = ({ bgcolor = "#2c2c2c", team }) => {
  const headerRef = useRef<HTMLDivElement>(null);
  return (
    <Root
      position="static"
      elevation={0}
      color="transparent"
      ref={headerRef}
      style={{
        backgroundColor: team?.theme?.primary || bgcolor,
      }}
    >
      <Toolbar headerRef={headerRef} team={team}></Toolbar>
    </Root>
  );
};

export default Header;
