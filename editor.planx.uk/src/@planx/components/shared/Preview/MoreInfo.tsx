import CancelIcon from "@mui/icons-material/Cancel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloseIcon from "@mui/icons-material/Close";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Drawer, { DrawerProps } from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { contentFlowSpacing } from "@planx/components/shared/Preview/Card";
import React from "react";
import FeedbackDisclaimer from "ui/public/FeedbackDisclaimer";
import FeedbackOption from "ui/public/FeedbackOption";
import Input from "ui/shared/Input";

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

const MoreInfoFeedback = styled(Box)(({ theme }) => ({
  borderTop: `2px solid ${theme.palette.border.main}`,
  padding: theme.spacing(2.5, 4, 8, 0),
  [theme.breakpoints.up("sm")]: {
    padding: theme.spacing(3, 4, 8, 1),
  },
}));

const FeedbackBody = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1, 0),
  "& form > * + *": {
    ...contentFlowSpacing(theme),
  },
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
    <Container maxWidth={false} role="main" sx={{ bgcolor: "white" }}>
      <DrawerContent>{children}</DrawerContent>
    </Container>

    <MoreInfoFeedback>
      <Container maxWidth={false}>
        <Typography variant="h4" component="h3" gutterBottom>
          Did this help to answer your question?
        </Typography>
        <FeedbackBody>
          <FeedbackOption
            icon={CheckCircleIcon}
            label="Yes"
            format="positive"
          />
          <FeedbackOption icon={CancelIcon} label="No" format="negative" />
        </FeedbackBody>
      </Container>
    </MoreInfoFeedback>

    <MoreInfoFeedback>
      <Container maxWidth={false}>
        <Typography variant="h4" component="h3" gutterBottom>
          Please help us to improve this service by sharing feedback
        </Typography>
        <FeedbackBody>
          <form>
            <Input multiline bordered aria-describedby="comment-title" />
            <FeedbackDisclaimer />
            <Button variant="contained" sx={{ marginTop: 2.5 }}>
              Send feedback
            </Button>
          </form>
        </FeedbackBody>
      </Container>
    </MoreInfoFeedback>

    <MoreInfoFeedback>
      <Container maxWidth={false}>
        <Typography variant="h4" component="h3" gutterBottom>
          Thank you for sharing feedback
        </Typography>
        <FeedbackBody>
          <Typography variant="body2">
            We appreciate it lorem ipsum dolor sit amet, consectetuer adipiscing
            elit. Aenean commodo ligula eget dolor.
          </Typography>
        </FeedbackBody>
      </Container>
    </MoreInfoFeedback>
  </Root>
);

export default MoreInfo;
