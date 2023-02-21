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
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import { styled } from "@mui/styles";
import { Route } from "navi";
import React, { useRef, useState } from "react";
import {
  Link as ReactNaviLink,
  useCurrentRoute,
  useNavigation,
} from "react-navi";
import { borderedFocusStyle, focusStyle } from "theme";
import { Team } from "types";
import Reset from "ui/icons/Reset";

import { useStore } from "../pages/FlowEditor/lib/store";
import { rootFlowPath } from "../routes/utils";
import AnalyticsDisabledBanner from "./AnalyticsDisabledBanner";

export const HEADER_HEIGHT = 75;

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

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  marginTop: theme.spacing(1),
  height: HEADER_HEIGHT,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
}));

const ProfileSection = styled(Toolbar)(({ theme }) => ({
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
  backgroundColor: theme.palette.primary.dark,
  padding: theme.spacing(1.5),
  paddingLeft: theme.spacing(4),
  fontSize: 16,
}));

const SectionName = styled(Typography)(({ theme }) => ({
  fontSize: "inherit",
  fontWeight: "bold",
}));

const SectionCount = styled(Typography)(({ theme }) => ({
  fontSize: "inherit",
}));

/**
 * Describes the differing headers, based on the primary routes through which a flow can be interacted with
 */
export enum HeaderVariant {
  Preview,
  Unpublished,
  Editor,
}

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
  const isVisible = true;
  return (
    isVisible && (
      <StyledNavBar>
        <SectionCount>Section 1 of 6</SectionCount>
        <SectionName>About your project</SectionName>
      </StyledNavBar>
    )
  );
};

const PublicToolbar: React.FC<{
  team?: Team;
  handleRestart?: () => void;
  route: Route;
}> = ({ team, handleRestart, route }) => {
  const { navigate } = useNavigation();

  // Center the service title on desktop layouts, or drop it to second line on mobile
  // ref https://design-system.service.gov.uk/styles/page-template/
  const showCenteredServiceTitle = useMediaQuery("(min-width:600px)");

  return (
    <>
      <SkipLink href="#main-content">Skip to main content</SkipLink>
      <StyledToolbar>
        {team?.theme?.logo ? (
          <TeamLogo team={team}></TeamLogo>
        ) : (
          <Breadcrumbs route={route} handleClick={navigate}></Breadcrumbs>
        )}
        {showCenteredServiceTitle && <ServiceTitle />}
        <IconButton
          color="secondary"
          onClick={handleRestart}
          aria-label="Restart Application"
          size="large"
        >
          <Reset color="secondary" />
        </IconButton>
      </StyledToolbar>
      {!showCenteredServiceTitle && <ServiceTitle />}
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
        <Breadcrumbs route={route} handleClick={handleClick}></Breadcrumbs>
        <Box display="flex" alignItems="center">
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
        </Box>
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

const Header: React.FC<{
  bgcolor?: string;
  team?: Team;
  handleRestart?: () => void;
  variant: HeaderVariant;
}> = ({ bgcolor = "#2c2c2c", team, handleRestart, variant }) => {
  const headerRef = useRef<HTMLDivElement>(null);
  const route = useCurrentRoute();

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
      {variant === HeaderVariant.Editor ? (
        <EditorToolbar headerRef={headerRef} route={route}></EditorToolbar>
      ) : (
        <PublicToolbar
          team={team}
          handleRestart={handleRestart}
          route={route}
        />
      )}
    </Root>
  );
};

export default Header;
