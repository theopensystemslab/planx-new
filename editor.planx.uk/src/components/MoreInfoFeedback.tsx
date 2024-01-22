import CancelIcon from "@mui/icons-material/Cancel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { contentFlowSpacing } from "@planx/components/shared/Preview/Card";
import React from "react";
import FeedbackDisclaimer from "ui/public/FeedbackDisclaimer";
import FeedbackOption from "ui/public/FeedbackOption";
import Input from "ui/shared/Input";

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

const MoreInfoFeedbackComponent: React.FC = () => {
  return (
    <>
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
              We appreciate it lorem ipsum dolor sit amet, consectetuer
              adipiscing elit. Aenean commodo ligula eget dolor.
            </Typography>
          </FeedbackBody>
        </Container>
      </MoreInfoFeedback>
    </>
  );
};

export default MoreInfoFeedbackComponent;
