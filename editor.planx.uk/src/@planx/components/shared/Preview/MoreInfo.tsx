import CloseIcon from "@mui/icons-material/Close";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import makeStyles from "@mui/styles/makeStyles";
import classNames from "classnames";
import React from "react";

const moreInfoStyles = makeStyles((theme) => ({
  drawer: (props: { drawerWidth: 400 }) => ({
    width: props.drawerWidth,
    flexShrink: 0,
    color: theme.palette.text.primary,
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginRight: -props.drawerWidth,
    [theme.breakpoints.only("xs")]: {
      width: "100%",
      marginRight: "-100%",
    },
  }),
  drawerShift: {
    marginRight: 0,
  },
  drawerTitle: {
    marginTop: theme.spacing(1),
    fontWeight: 700,
    fontSize: "1.15rem",
    flexGrow: 1,
  },
  drawerContent: {
    padding: "0.5rem 1.75rem 1rem",
    fontSize: "1rem",
    lineHeight: "1.5",
  },
  drawerPaper: (props: { drawerWidth: 400 }) => ({
    width: props.drawerWidth,
    backgroundColor: theme.palette.background.default,
    border: 0,
    boxShadow: "-4px 0 0 rgba(0,0,0,0.1)",
    [theme.breakpoints.only("xs")]: {
      width: "100%",
    },
    padding: theme.spacing(1),
  }),
  close: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
  },
}));

interface IMoreInfo {
  open: boolean;
  children: (JSX.Element | string | undefined)[] | JSX.Element;
  handleClose: Function;
}

const MoreInfo: React.FC<IMoreInfo> = ({ open, children, handleClose }) => {
  const classes = moreInfoStyles({ drawerWidth: 400 } as any);
  return (
    <Drawer
      className={classNames(classes.drawer, {
        [classes.drawerShift]: open,
      })}
      anchor="right"
      aria-modal="true"
      role="dialog"
      aria-label="Further information about this question and the policies pertaining to it"
      open={open}
      onClose={() => handleClose()}
      classes={{
        paper: classes.drawerPaper,
      }}
    >
      <div className={classes.close}>
        <IconButton
          onClick={() => handleClose()}
          role="button"
          title="Close panel"
          aria-label="Close panel"
          size="large"
        >
          <CloseIcon />
        </IconButton>
      </div>
      <div role="main">
        <div className={classes.drawerContent}>{children}</div>
      </div>
    </Drawer>
  );
};

export default MoreInfo;
