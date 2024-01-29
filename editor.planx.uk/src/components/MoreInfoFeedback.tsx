import CancelIcon from "@mui/icons-material/Cancel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { contentFlowSpacing } from "@planx/components/shared/Preview/Card";
import {
  getInternalFeedbackMetadata,
  insertFeedbackMutation,
} from "lib/feedback";
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
  type View = "yes/no" | "input" | "thanks";

  type Sentiment = "helpful" | "unhelpful";

  const [currentFeedbackView, setCurrentFeedbackView] =
    useState<View>("yes/no");
  const [feedbackOption, setFeedbackOption] = useState<Sentiment | null>(null);

  const handleFeedbackOptionClick = (event: Sentiment) => {
    switch (event) {
      case "helpful":
        setCurrentFeedbackView("input");
        setFeedbackOption("helpful");
        break;

      case "unhelpful":
        setCurrentFeedbackView("input");
        setFeedbackOption("unhelpful");
        break;
    }
  };

  async function handleFeedbackFormSubmit(e: any) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const formDataPayload: any = {};

    for (const [key, value] of formData.entries()) {
      formDataPayload[key] = value;
    }

    // Extract relevant data above the flow/card
    const metadata: any = await getInternalFeedbackMetadata();

    // Check the feedback type
    const feedbackType = { feedbackType: feedbackOption };

    const data = { ...metadata, ...feedbackType, ...formDataPayload };

    await insertFeedbackMutation(data);
    setCurrentFeedbackView("thanks");
  }

  function FeedbackYesNo(): FCReturn {
    return (
      <MoreInfoFeedback>
        <Container maxWidth={false}>
          <Typography variant="h4" component="h3" gutterBottom>
            Did this help to answer your question?
          </Typography>
          <FeedbackBody>
            <FeedbackOption
              onClick={() => handleFeedbackOptionClick("helpful")}
              Icon={CheckCircleIcon}
              label="Yes"
              format="positive"
            />
            <FeedbackOption
              onClick={() => handleFeedbackOptionClick("unhelpful")}
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
      case "yes/no":
        return <FeedbackYesNo />;

      case "input":
        return <FeedbackInput />;

      case "thanks":
        return <FeedbackThankYou />;
    }
  }

  return <MoreInfoFeedbackView />;
};

export default MoreInfoFeedbackComponent;
