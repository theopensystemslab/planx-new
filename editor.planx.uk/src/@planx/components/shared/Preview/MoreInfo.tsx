import CloseIcon from "@mui/icons-material/Close";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Drawer, { DrawerProps } from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import { styled } from "@mui/material/styles";
import MoreInfoFeedbackComponent from "components/Feedback/MoreInfoFeedback";
import { hasFeatureFlag } from "lib/featureFlags";
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

  [`& .${classes.drawerPaper}`]: {
    width: "100%",
    maxWidth: drawerWidth,
    backgroundColor: theme.palette.background.paper,
    border: 0,
    boxShadow: "-4px 0 0 rgba(0,0,0,0.1)",
  },
}));

const DrawerContent = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2.5, 4, 2, 0),
  fontSize: "1rem",
  lineHeight: "1.5",
  [theme.breakpoints.up("sm")]: {
    padding: theme.spacing(6, 4, 4, 1),
  },
}));

const CloseButton = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  position: "fixed",
  top: theme.spacing(1),
  right: theme.spacing(1),
  color: theme.palette.text.primary,
}));

const isUsingFeatureFlag = hasFeatureFlag("SHOW_INTERNAL_FEEDBACK");

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
        color="inherit"
      >
        <CloseIcon />
      </IconButton>
    </CloseButton>
    <Container maxWidth={false} role="main" sx={{ bgcolor: "white" }}>
      <DrawerContent>{children}</DrawerContent>
    </Container>
    {isUsingFeatureFlag && <MoreInfoFeedbackComponent />}
  </Root>
);

export default MoreInfo;
