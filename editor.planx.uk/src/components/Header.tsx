import AppBar from "@material-ui/core/AppBar";
import Avatar from "@material-ui/core/Avatar";
import Box from "@material-ui/core/Box";
import IconButton from "@material-ui/core/IconButton";
import MenuItem from "@material-ui/core/MenuItem";
import Paper from "@material-ui/core/Paper";
import Popover from "@material-ui/core/Popover";
import { makeStyles } from "@material-ui/core/styles";
import Toolbar from "@material-ui/core/Toolbar";
import KeyboardArrowDown from "@material-ui/icons/KeyboardArrowDown";
import MenuOpenIcon from "@material-ui/icons/MenuOpen";
import React, { useRef, useState } from "react";
import { Link, useCurrentRoute, useNavigation } from "react-navi";
import Reset from "ui/icons/Reset";

import { useStore } from "../pages/FlowEditor/lib/store";
import { rootFlowPath } from "../routes/utils";
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
}));

const Header: React.FC<{
  bgcolor?: string;
  logo?: string;
  phaseBanner?: boolean;
  handleRestart?: () => void;
}> = ({ bgcolor = "#2c2c2c", logo, phaseBanner = false, handleRestart }) => {
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const headerRef = useRef(null);
  const { navigate } = useNavigation();
  const togglePreview = useStore((state) => state.togglePreview);

  const { data } = useCurrentRoute();

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
      <AppBar
        position="static"
        elevation={0}
        className={classes.root}
        color="transparent"
        ref={headerRef}
        style={{
          backgroundColor: bgcolor,
        }}
      >
        <Toolbar className={classes.toolbar}>
          <Box className={classes.breadcrumbs} fontSize={20}>
            {logo ? (
              <img alt="Team logo" src={logo} className={classes.logo} />
            ) : (
              <Box
                component="span"
                color="#999"
                onClick={() => handleClick("/")}
              >
                Plan✕
              </Box>
            )}

            {data.team && (
              <>
                {" / "}
                <Link
                  href={`/${data.team}`}
                  prefetch={false}
                  className={classes.breadcrumb}
                >
                  {data.team}
                </Link>
              </>
            )}
            {data.flow && (
              <>
                {" / "}
                <Link
                  href={rootFlowPath(false)}
                  prefetch={false}
                  className={classes.breadcrumb}
                >
                  {data.flow}
                </Link>
              </>
            )}
          </Box>
          <Box display="flex" alignItems="center">
            {data.username && (
              <Box className={classes.profileSection} mr={2}>
                {data.flow && (
                  <Box mr={2}>
                    <MenuOpenIcon
                      onClick={togglePreview}
                      style={{ cursor: "pointer" }}
                    />
                  </Box>
                )}
                <Box mr={1}>
                  <Avatar>{data.username[0]}</Avatar>
                </Box>
                <IconButton
                  edge="end"
                  color="inherit"
                  onClick={handleMenuToggle}
                >
                  <KeyboardArrowDown />
                </IconButton>
              </Box>
            )}
            {handleRestart && (
              <IconButton color="secondary" onClick={handleRestart}>
                <Reset title="Restart Application" color="secondary" />
              </IconButton>
            )}
          </Box>
        </Toolbar>
        {phaseBanner && <PhaseBanner />}
      </AppBar>
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
          {data.flow && (
            <MenuItem
              onClick={() =>
                handleClick([rootFlowPath(true), "settings"].join("/"))
              }
            >
              Settings
            </MenuItem>
          )}

          <MenuItem onClick={() => navigate("/logout")}>Log out</MenuItem>
        </Paper>
      </Popover>
    </>
  );
};

export default Header;
