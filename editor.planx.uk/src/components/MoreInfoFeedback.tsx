import CancelIcon from "@mui/icons-material/Cancel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { contentFlowSpacing } from "@planx/components/shared/Preview/Card";
import React, { useState } from "react";
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
  enum FeedbackView {
    YesNo,
    Input,
    ThankYou,
  }

  enum FeedbackSentimentOption {
    Yes,
    No,
  }

  const [currentFeedbackView, setCurrentFeedbackView] = useState(
    FeedbackView.YesNo,
  );
  const [feedbackOption, setFeedbackOption] =
    useState<FeedbackSentimentOption | null>(null);

  const handleFeedbackOptionClick = (event: FeedbackSentimentOption) => {
    switch (event) {
      case FeedbackSentimentOption.Yes:
        setCurrentFeedbackView(FeedbackView.Input);
        setFeedbackOption(FeedbackSentimentOption.Yes);
        break;

      case FeedbackSentimentOption.No:
        setCurrentFeedbackView(FeedbackView.Input);
        setFeedbackOption(FeedbackSentimentOption.No);
        break;
    }
  };

  const handleFeedbackFormSubmit = (e: any) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const formDataPayload: any = {};

    for (const [key, value] of formData.entries()) {
      formDataPayload[key] = value;
    }

    console.log("The users selection", feedbackOption);

    console.log("The user inputs", formDataPayload);
    // Prep the form data payload?

    setCurrentFeedbackView(FeedbackView.ThankYou);
  };

  function FeedbackYesNo(): FCReturn {
    return (
      <MoreInfoFeedback>
        <Container maxWidth={false}>
          <Typography variant="h4" component="h3" gutterBottom>
            Did this help to answer your question?
          </Typography>
          <FeedbackBody>
            <FeedbackOption
              handleClick={() =>
                handleFeedbackOptionClick(FeedbackSentimentOption.Yes)
              }
              Icon={CheckCircleIcon}
              label="Yes"
              format="positive"
            />
            <FeedbackOption
              handleClick={() =>
                handleFeedbackOptionClick(FeedbackSentimentOption.No)
              }
              Icon={CancelIcon}
              label="No"
              format="negative"
            />
          </FeedbackBody>
        </Container>
      </MoreInfoFeedback>
    );
  }

  function FeedbackInput(): FCReturn {
    return (
      <MoreInfoFeedback>
        <Container maxWidth={false}>
          <Typography variant="h4" component="h3" gutterBottom>
            Please help us to improve this service by sharing feedback
          </Typography>
          <FeedbackBody>
            <form onSubmit={(e) => handleFeedbackFormSubmit(e)}>
              <Input
                name="userComment"
                required
                multiline
                bordered
                aria-describedby="comment-title"
              />
              <FeedbackDisclaimer />
              <Button type="submit" variant="contained" sx={{ marginTop: 2.5 }}>
                Send feedback
              </Button>
            </form>
          </FeedbackBody>
        </Container>
      </MoreInfoFeedback>
    );
  }

  function FeedbackThankYou(): FCReturn {
    return (
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
    );
  }

  function MoreInfoFeedbackView(): FCReturn {
    switch (currentFeedbackView) {
      case FeedbackView.YesNo:
        return <FeedbackYesNo />;

      case FeedbackView.Input:
        return <FeedbackInput />;

      case FeedbackView.ThankYou:
        return <FeedbackThankYou />;
    }
  }

  return <MoreInfoFeedbackView />;
};

export default MoreInfoFeedbackComponent;
