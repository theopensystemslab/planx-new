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
import useMediaQuery from "@mui/material/useMediaQuery";
import makeStyles from "@mui/styles/makeStyles";
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
import PhaseBanner from "./PhaseBanner";

export const HEADER_HEIGHT = 75;

const useStyles = makeStyles((theme) => ({
  root: {
    // backgroundColor: "#2c2c2c",
    color: "#fff",
  },
  breadcrumbs: {
    cursor: "pointer",
  },
  breadcrumb: {
    color: "#fff",
    textDecoration: "none",
  },
  toolbar: {
    marginTop: theme.spacing(1),
    height: HEADER_HEIGHT,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  profileSection: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  popover: {
    boxShadow: "4px 4px 0px rgba(150, 150, 150, 0.5)",
    backgroundColor: "#2c2c2c",
    borderRadius: 0,
  },
  paper: {
    backgroundColor: "#2c2c2c",
    color: "#fff",
    borderRadius: 0,
    boxShadow: "none",
    minWidth: 180,
    "& li": {
      padding: theme.spacing(1.5, 2),
    },
  },
  logo: {
    height: HEADER_HEIGHT - 5,
    width: "100%",
    maxWidth: 140,
    objectFit: "contain",
  },
  logoLink: {
    display: "inline-block",
    "&:focus-visible": borderedFocusStyle,
  },
  skipLink: {
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
  },
  analyticsWarning: {
    display: "flex",
    backgroundColor: "#FFFB00",
    padding: "0 24px",
    color: "#070707",
    justifyContent: "space-between",
    alignItems: "center",
  },
  serviceTitle: {
    fontSize: "1.25em",
    fontWeight: 700,
    paddingLeft: theme.spacing(2),
    paddingBottom: theme.spacing(1),
  },
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
  const classes = useStyles();
  const altText = team?.settings?.homepage
    ? `${team.name} Homepage (opens in a new tab)`
    : `${team?.name} Logo`;
  const logo = (
    <img alt={altText} src={team?.theme?.logo} className={classes.logo} />
  );
  return team?.settings?.homepage ? (
    <Link
      href={team.settings.homepage}
      target="_blank"
      className={classes.logoLink}
    >
      {logo}
    </Link>
  ) : (
    logo
  );
};

const Breadcrumbs: React.FC<{
  route: Route;
  handleClick?: (href: string) => void;
}> = ({ route, handleClick }) => {
  const classes = useStyles();
  return (
    <Box className={classes.breadcrumbs} fontSize={20}>
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
            component={ReactNaviLink}
            href={`/${route.data.team}`}
            prefetch={false}
            className={classes.breadcrumb}
          >
            {route.data.team}
          </Link>
        </>
      )}
      {route.data.flow && (
        <>
          {" / "}
          <Link
            component={ReactNaviLink}
            href={rootFlowPath(false)}
            prefetch={false}
            className={classes.breadcrumb}
          >
            {route.data.flow}
          </Link>
        </>
      )}
    </Box>
  );
};

const PublicToolbar: React.FC<{
  team?: Team;
  handleRestart?: () => void;
  route: Route;
}> = ({ team, handleRestart, route }) => {
  const classes = useStyles();
  const { navigate } = useNavigation();

  // Center the service title on desktop layouts, or drop it to second line on mobile
  // ref https://design-system.service.gov.uk/styles/page-template/
  const showCenteredServiceTitle = useMediaQuery("(min-width:600px)");

  return (
    <>
      <a tabIndex={0} className={classes.skipLink} href="#main-content">
        Skip to main content
      </a>
      <Toolbar className={classes.toolbar}>
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
      </Toolbar>
      {!showCenteredServiceTitle && <ServiceTitle />}
      <AnalyticsDisabledBanner />
      <PhaseBanner />
    </>
  );
};

const ServiceTitle: React.FC = () => {
  const classes = useStyles();
  const flowName = useStore((state) => state.flowName);

  return (
    <span data-testid="service-title" className={classes.serviceTitle}>
      {flowName}
    </span>
  );
};

const EditorToolbar: React.FC<{
  headerRef: React.RefObject<HTMLElement>;
  route: Route;
}> = ({ headerRef, route }) => {
  const [open, setOpen] = useState(false);
  const togglePreview = useStore((state) => state.togglePreview);

  const classes = useStyles();
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
      <Toolbar className={classes.toolbar}>
        <Breadcrumbs route={route} handleClick={handleClick}></Breadcrumbs>
        <Box display="flex" alignItems="center">
          {route.data.username && (
            <Box className={classes.profileSection} mr={2}>
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
            </Box>
          )}
        </Box>
      </Toolbar>
      <Popover
        open={open}
        anchorEl={headerRef.current}
        onClose={handleClose}
        classes={{
          paper: classes.popover,
        }}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <Paper className={classes.paper}>
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
        </Paper>
      </Popover>
    </>
  );
};

const Header: React.FC<{
  bgcolor?: string;
  team?: Team;
  handleRestart?: () => void;
  variant: HeaderVariant;
}> = ({ bgcolor = "#2c2c2c", team, handleRestart, variant }) => {
  const classes = useStyles();
  const headerRef = useRef<HTMLDivElement>(null);
  const route = useCurrentRoute();

  return (
    <AppBar
      position="static"
      elevation={0}
      className={classes.root}
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
    </AppBar>
  );
};

export default Header;
