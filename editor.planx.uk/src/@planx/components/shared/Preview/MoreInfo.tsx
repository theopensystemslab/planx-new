import CloseIcon from "@mui/icons-material/Close";
import Drawer, { DrawerProps } from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import { styled } from "@mui/material/styles";
import React from "react";

const PREFIX = "MoreInfo";

const classes = {
  drawerPaper: `${PREFIX}-drawerPaper`,
};

interface StyledDrawerProps extends DrawerProps {
  drawerWidth: number;
}

const Root = styled(Drawer, {
  shouldForwardProp: (prop) => prop !== "drawerWidth",
})<StyledDrawerProps>(({ theme, drawerWidth, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  color: theme.palette.text.primary,
  transition: theme.transitions.create("margin", {
    easing: theme.transitions.easing.easeOut,
    duration: theme.transitions.duration.enteringScreen,
  }),
  marginRight: open ? 0 : -drawerWidth,
  [theme.breakpoints.only("xs")]: {
    width: "100%",
    marginRight: "-100%",
  },

  [`&.${classes.drawerPaper}`]: {
    width: drawerWidth,
    backgroundColor: theme.palette.background.default,
    border: 0,
    boxShadow: "-4px 0 0 rgba(0,0,0,0.1)",
    [theme.breakpoints.only("xs")]: {
      width: "100%",
    },
    padding: theme.spacing(1),
  },
}));

const DrawerContent = styled("div")(() => ({
  padding: "0.5rem 1.75rem 1rem",
  fontSize: "1rem",
  lineHeight: "1.5",
}));

const CloseButton = styled("div")(() => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
}));

interface IMoreInfo {
  open: boolean;
  children: (JSX.Element | string | undefined)[] | JSX.Element;
  handleClose: Function;
}

const MoreInfo: React.FC<IMoreInfo> = ({ open, children, handleClose }) => (
  <Root
    anchor="right"
    drawerWidth={600}
    aria-modal="true"
    role="dialog"
    aria-label="Further information about this question and the policies pertaining to it"
    open={open}
    onClose={() => handleClose()}
    classes={{
      paper: classes.drawerPaper,
    }}
  >
    <CloseButton>
      <IconButton
        onClick={() => handleClose()}
        role="button"
        title="Close panel"
        aria-label="Close panel"
        size="large"
      >
        <CloseIcon />
      </IconButton>
    </CloseButton>
    <div role="main">
      <DrawerContent>{children}</DrawerContent>
    </div>
  </Root>
);

export default MoreInfo;
