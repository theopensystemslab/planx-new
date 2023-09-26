import CancelIcon from "@mui/icons-material/Cancel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloseIcon from "@mui/icons-material/Close";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Drawer, { DrawerProps } from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import Link from "@mui/material/Link";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
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
    backgroundColor: theme.palette.background.default,
    border: 0,
    boxShadow: "-4px 0 0 rgba(0,0,0,0.1)",
  },
}));

const DrawerContent = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2.5, 4, 0, 0),
  fontSize: "1rem",
  lineHeight: "1.5",
  [theme.breakpoints.up("sm")]: {
    padding: theme.spacing(6, 4, 0, 1),
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

const MoreInfoFeedback = styled(Box)(({ theme }) => ({
  display: "flex",
  height: "100%",
  backgroundColor: theme.palette.background.paper,
  borderTop: `2px solid ${theme.palette.border.main}`,
  padding: theme.spacing(2.5, 4, 8, 0),
  [theme.breakpoints.up("sm")]: {
    padding: theme.spacing(3, 4, 8, 1),
  },
}));

const FeedbackButtons = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "row",
  flexWrap: "wrap",
  padding: theme.spacing(1, 0, 2),
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
        color="inherit"
      >
        <CloseIcon />
      </IconButton>
    </CloseButton>
    <Container maxWidth={false} role="main">
      <DrawerContent>{children}</DrawerContent>
    </Container>
    <MoreInfoFeedback>
      <Container maxWidth={false}>
        <Typography variant="h4" component="h3" gutterBottom>
          Did this help to answer your question?
        </Typography>
        <FeedbackButtons>
          <Button
            variant="contained"
            size="small"
            color="secondary"
            sx={{ mr: 1 }}
          >
            <CheckCircleIcon color="success" sx={{ mr: 0.5 }} />
            Yes
          </Button>
          <Button variant="contained" size="small" color="secondary">
            <CancelIcon color="error" sx={{ mr: 0.5 }} />
            No
          </Button>
        </FeedbackButtons>
        <Typography variant="body1">
          <Link component="button">Give us feedback about this content</Link>
        </Typography>
      </Container>
    </MoreInfoFeedback>
  </Root>
);

export default MoreInfo;
