import CancelIcon from "@mui/icons-material/Cancel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
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
          <Box>
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
          </Box>
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
          <Typography
            variant="h4"
            component="h3"
            gutterBottom
            id="comment-title"
          >
            Please help us to improve this service by sharing feedback
          </Typography>
          <FeedbackForm
            inputs={commentFormInputs}
            handleSubmit={handleFeedbackFormSubmit}
          />
        </Container>
      </MoreInfoFeedback>
    );
  }

  function FeedbackThankYou(): FCReturn {
    return (
      <MoreInfoFeedback>
        <Container maxWidth={false}>
          <Typography variant="h4" component="h3" gutterBottom>
            Thank you for your feedback.
          </Typography>
          <Typography variant="body2" pt={1}>
            We value the time you’ve taken to share. We’ll use your insights to
            improve our services.
          </Typography>
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
