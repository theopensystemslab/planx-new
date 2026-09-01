import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Drawer from "@mui/material/Drawer";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { visuallyHidden } from "@mui/utils";
import MoreInfoFeedbackComponent from "components/Feedback/MoreInfoFeedback/MoreInfoFeedback";
import React from "react";
import { CloseButton } from "ui/shared/CloseButton";

const DrawerContent = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2.5, 4, 2, 0),
  fontSize: "1rem",
  lineHeight: "1.5",
  [theme.breakpoints.up("sm")]: {
    padding: theme.spacing(3, 4, 3, 1),
  },
}));

const CloseButtonWrapper = styled(Box)(({ theme }) => ({
  position: "fixed",
  top: theme.spacing(1),
  right: theme.spacing(1),
  zIndex: theme.zIndex.drawer + 1,
}));

interface IMoreInfo {
  open: boolean;
  children: (React.JSX.Element | string | undefined)[] | React.JSX.Element;
  handleClose: Function;
}

const MoreInfo: React.FC<IMoreInfo> = ({ open, children, handleClose }) => (
  <Drawer
    aria-label="Further information about this question and the policies pertaining to it"
    open={open}
    onClose={() => handleClose()}
  >
    <CloseButtonWrapper>
      <CloseButton
        onClick={() => handleClose()}
        title="Close panel"
        color="inherit"
      />
    </CloseButtonWrapper>
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
