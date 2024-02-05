import CancelIcon from "@mui/icons-material/Cancel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { contentFlowSpacing } from "@planx/components/shared/Preview/Card";
import {
  getInternalFeedbackMetadata,
  insertFeedbackMutation,
} from "lib/feedback";
import React, { useEffect, useRef, useState } from "react";
import FeedbackOption from "ui/public/FeedbackOption";

import { FeedbackFormInput, UserFeedback } from ".";
import FeedbackForm from "./FeedbackForm";

const MoreInfoFeedback = styled(Box)(({ theme }) => ({
  borderTop: `2px solid ${theme.palette.border.main}`,
  padding: theme.spacing(2.5, 4, 8, 0),
  [theme.breakpoints.up("sm")]: {
    padding: theme.spacing(3, 4, 8, 1),
  },
}));

const FeedbackBody = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1, 0),
  "& form > * + *": contentFlowSpacing(theme),
}));

const MoreInfoFeedbackComponent: React.FC = () => {
  type View = "yes/no" | "input" | "thanks";

  type Sentiment = "helpful" | "unhelpful";

  const [currentFeedbackView, setCurrentFeedbackView] =
    useState<View>("yes/no");
  const [feedbackOption, setFeedbackOption] = useState<Sentiment | null>(null);
  const feedbackComponentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (currentFeedbackView === "input") {
      feedbackComponentRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [currentFeedbackView]);

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

  async function handleFeedbackFormSubmit(values: UserFeedback) {
    if (!feedbackOption) return;
    const metadata = await getInternalFeedbackMetadata();
    const feedbackType = { feedbackType: feedbackOption };
    const data = { ...metadata, ...feedbackType, ...values };
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
    const commentFormInputs: FeedbackFormInput[] = [
      {
        name: "userComment",
        ariaDescribedBy: "comment-title",
      },
    ];

    return (
      <MoreInfoFeedback>
        <Container maxWidth={false}>
          <Typography variant="h4" component="h3" gutterBottom>
            Please help us to improve this service by sharing feedback
          </Typography>
          <FeedbackBody>
            <FeedbackForm
              inputs={commentFormInputs}
              handleSubmit={handleFeedbackFormSubmit}
            />
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
              Your input on the helpfulness of the provided assistance is
              crucial for us to refine and improve. We appreciate your time in
              helping us enhance our services.
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

  return (
    <Box ref={feedbackComponentRef}>
      <MoreInfoFeedbackView />
    </Box>
  );
};

export default MoreInfoFeedbackComponent;
