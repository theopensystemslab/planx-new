import CloseIcon from "@mui/icons-material/Close";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { visuallyHidden } from "@mui/utils";
import MoreInfoFeedbackComponent from "components/Feedback/MoreInfoFeedback/MoreInfoFeedback";
import React from "react";

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
  zIndex: theme.zIndex.drawer + 1,
}));

interface IMoreInfo {
  open: boolean;
  children: (JSX.Element | string | undefined)[] | JSX.Element;
  handleClose: Function;
}

const MoreInfo: React.FC<IMoreInfo> = ({ open, children, handleClose }) => (
  <Drawer
    aria-label="Further information about this question and the policies pertaining to it"
    open={open}
    onClose={() => handleClose()}
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
    <Container maxWidth={false} sx={{ bgcolor: "white" }}>
      <Typography variant="h1" sx={visuallyHidden}>
        More information
      </Typography>
      <DrawerContent>{children}</DrawerContent>
    </Container>
    <MoreInfoFeedbackComponent />
  </Drawer>
);

export default MoreInfo;
