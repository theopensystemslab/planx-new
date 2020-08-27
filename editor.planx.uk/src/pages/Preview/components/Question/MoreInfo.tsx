import Drawer from "@material-ui/core/Drawer";
import IconButton from "@material-ui/core/IconButton";
import makeStyles from "@material-ui/core/styles/makeStyles";
import CloseIcon from "@material-ui/icons/Close";
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
  children: JSX.Element[] | JSX.Element;
  handleClose: Function;
}

const MoreInfo: React.FC<IMoreInfo> = ({ open, children, handleClose }) => {
  const classes = moreInfoStyles({ drawerWidth: 400 } as any);
  return (
    <Drawer
      className={classNames(classes.drawer, {
        [classes.drawerShift]: open,
      })}
      variant="persistent"
      anchor="right"
      open={open}
      classes={{
        paper: classes.drawerPaper,
      }}
    >
      <div className={classes.close}>
        <IconButton onClick={() => handleClose()} aria-label="Close Panel">
          <CloseIcon />
        </IconButton>
      </div>

      <div className={classes.drawerContent}>{children}</div>
    </Drawer>
  );
};

export default MoreInfo;
