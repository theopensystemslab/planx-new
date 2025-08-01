import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloseIcon from "@mui/icons-material/Close";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import RuleIcon from "@mui/icons-material/Rule";
import WarningIcon from "@mui/icons-material/Warning";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import {
  getInternalFeedbackMetadata,
  insertFeedbackMutation,
} from "lib/feedback";
import { useStore } from "pages/FlowEditor/lib/store";
import { BackButton } from "pages/Preview/Questions";
import React, { useEffect, useState } from "react";
import { usePrevious } from "react-use";
import FeedbackOption from "ui/public/FeedbackOption";

import FeedbackForm from "./FeedbackForm/FeedbackForm";
import FeedbackPhaseBanner from "./FeedbackPhaseBanner";
import {
  CloseButton,
  FeedbackBody,
  FeedbackHeader,
  FeedbackRow,
  FeedbackTitle,
  FeedbackWrapper,
} from "./styled";
import {
  ClickEvents,
  FeedbackFormInput,
  FeedbackView,
  TitleAndCloseProps,
  UserFeedback,
} from "./types";

const Feedback: React.FC = () => {
  const [currentFeedbackView, setCurrentFeedbackView] =
    useState<FeedbackView | null>(null);
  const previousFeedbackView = usePrevious(currentFeedbackView);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setCurrentFeedbackView(null);
  }

  function handleFeedbackViewClick(event: ClickEvents) {
    switch (event) {
      case "close":
        closeDrawer();
        break;
      case "back":
        setCurrentFeedbackView("triage");
        break;
      default:
        setIsDrawerOpen(true);
        setCurrentFeedbackView(event);
        break;
    }
  }

  async function handleFeedbackFormSubmit(values: UserFeedback) {
    if (!currentFeedbackView) throw Error("Cannot submit feedback in current view");

    const metadata = await getInternalFeedbackMetadata();
    const feedbackType = { feedbackType: currentFeedbackView };
    const data = { ...metadata, ...feedbackType, ...values };
    await insertFeedbackMutation(data);
    setCurrentFeedbackView("thanks");
  }

  function BackAndCloseFeedbackHeader(): FCReturn {
    return (
      <FeedbackHeader>
        <BackButton onClick={() => handleFeedbackViewClick("back")}>
          <ArrowBackIcon fontSize="small" />
          Back
        </BackButton>
        <CloseButton onClick={() => handleFeedbackViewClick("close")}>
          <IconButton
            role="button"
            title="Close panel"
            aria-label="Close panel"
            size="large"
            color="inherit"
          >
            <CloseIcon />
          </IconButton>
        </CloseButton>
      </FeedbackHeader>
    );
  }

  function TitleAndCloseFeedbackHeader(props: TitleAndCloseProps): FCReturn {
    return (
      <FeedbackHeader>
        <FeedbackTitle>
          {props.Icon && <props.Icon />}
          <Typography variant="h3" component="h2">
            {props.title}
          </Typography>
        </FeedbackTitle>
        <CloseButton onClick={() => handleFeedbackViewClick("close")}>
          <IconButton
            role="button"
            title="Close panel"
            aria-label="Close panel"
            size="large"
            color="inherit"
          >
            <CloseIcon />
          </IconButton>
        </CloseButton>
      </FeedbackHeader>
    );
  }

  function ReportAnIssueTopBar(): FCReturn {
    if (previousFeedbackView === "triage") {
      return (
        <>
          <BackAndCloseFeedbackHeader />
          <FeedbackTitle>
            <WarningIcon />
            <Typography variant="h3" component="h2">
              Report an issue with this service
            </Typography>
          </FeedbackTitle>
        </>
      )
    }

    return (
      <TitleAndCloseFeedbackHeader
        Icon={WarningIcon}
        title="Report an issue with this service"
      />
    );
  }

  function FeedbackPhaseBannerView(): FCReturn {
    return (
      <FeedbackWrapper>
        <FeedbackPhaseBanner
          handleFeedbackClick={() => handleFeedbackViewClick("triage")}
          handleReportAnIssueClick={() => handleFeedbackViewClick("issue")}
        />
      </FeedbackWrapper>
    );
  }

  function Triage(): FCReturn {
    return (
      <FeedbackWrapper>
        <Container maxWidth="contentWrap">
          <FeedbackRow>
            <TitleAndCloseFeedbackHeader title="What would you like to share?" />
            <FeedbackBody>
              <FeedbackOption
                onClick={() => handleFeedbackViewClick("issue")}
                Icon={WarningIcon}
                label="Issue"
                showArrow
              />
              <FeedbackOption
                onClick={() => handleFeedbackViewClick("idea")}
                Icon={LightbulbIcon}
                label="Idea"
                showArrow
              />
              <FeedbackOption
                onClick={() => handleFeedbackViewClick("comment")}
                Icon={MoreHorizIcon}
                label="Comment"
                showArrow
              />
              <FeedbackOption
                onClick={() => handleFeedbackViewClick("inaccuracy")}
                Icon={RuleIcon}
                label="Inaccuracy"
                showArrow
              />
            </FeedbackBody>
          </FeedbackRow>
        </Container>
      </FeedbackWrapper>
    );
  }

  function ReportAnIssue(): FCReturn {
    const issueFormInputs: FeedbackFormInput[] = [
      {
        name: "userContext",
        label: "What were you doing?",
        id: "issue-input-1",
      },
      {
        name: "userComment",
        label: "What went wrong?",
        id: "issue-input-2",
      },
    ];

    return (
      <FeedbackWrapper>
        <Container maxWidth="contentWrap">
          <FeedbackRow>
            <ReportAnIssueTopBar />
            <FeedbackBody>
              <FeedbackForm
                inputs={issueFormInputs}
                handleSubmit={handleFeedbackFormSubmit}
              />
            </FeedbackBody>
          </FeedbackRow>
        </Container>
      </FeedbackWrapper>
    );
  }

  function ReportAnInaccuracy(): FCReturn {
    const issueFormInputs: FeedbackFormInput[] = [
      {
        name: "userComment",
        label: "What data is inaccurate?",
        id: "inaccuracy-input",
      },
    ];

    return (
      <FeedbackWrapper>
        <Container maxWidth="contentWrap">
          <FeedbackRow>
            <BackAndCloseFeedbackHeader />
            <FeedbackTitle>
              <RuleIcon />
              <Typography variant="h3" component="h2" id="idea-title">
                Report an inaccuracy
              </Typography>
            </FeedbackTitle>
            <FeedbackBody>
              <FeedbackForm
                inputs={issueFormInputs}
                handleSubmit={handleFeedbackFormSubmit}
              />
            </FeedbackBody>
          </FeedbackRow>
        </Container>
      </FeedbackWrapper>
    );
  }

  function ShareAnIdea(): FCReturn {
    const shareFormInputs: FeedbackFormInput[] = [
      {
        name: "userComment",
        label: "What's your idea?",
        id: "share-idea-input",
      },
    ];

    return (
      <FeedbackWrapper>
        <Container maxWidth="contentWrap">
          <FeedbackRow>
            <BackAndCloseFeedbackHeader />
            <FeedbackTitle>
              <LightbulbIcon />
              <Typography variant="h3" component="h2" id="idea-title">
                Share an idea
              </Typography>
            </FeedbackTitle>
            <FeedbackBody>
              <FeedbackForm
                inputs={shareFormInputs}
                handleSubmit={handleFeedbackFormSubmit}
              />
            </FeedbackBody>
          </FeedbackRow>
        </Container>
      </FeedbackWrapper>
    );
  }

  function ShareAComment(): FCReturn {
    const commentFormInputs: FeedbackFormInput[] = [
      {
        name: "userComment",
        label: "What's your comment?",
        id: "comment-input",
      },
    ];

    return (
      <FeedbackWrapper>
        <Container maxWidth="contentWrap">
          <FeedbackRow>
            <BackAndCloseFeedbackHeader />
            <FeedbackTitle>
              <MoreHorizIcon />
              <Typography variant="h3" component="h2" id="comment-title">
                Share a comment
              </Typography>
            </FeedbackTitle>
            <FeedbackBody>
              <FeedbackForm
                inputs={commentFormInputs}
                handleSubmit={handleFeedbackFormSubmit}
              />
            </FeedbackBody>
          </FeedbackRow>
        </Container>
      </FeedbackWrapper>
    );
  }

  function ThanksForFeedback(): FCReturn {
    return (
      <FeedbackWrapper>
        <Container maxWidth="contentWrap">
          <FeedbackRow>
            <TitleAndCloseFeedbackHeader title="Thank you for your feedback." />
            <FeedbackBody>
              <Typography variant="body1">
                We value the time you’ve taken to share. We’ll use your insights
                to improve our services.
              </Typography>
            </FeedbackBody>
          </FeedbackRow>
        </Container>
      </FeedbackWrapper>
    );
  }

  function Feedback(): FCReturn {
    switch (currentFeedbackView) {
      case "triage":
        return <Triage />;
      case "issue":
        return <ReportAnIssue />;
      case "idea":
        return <ShareAnIdea />;
      case "comment":
        return <ShareAComment />;
      case "inaccuracy":
        return <ReportAnInaccuracy />;
      case "thanks":
        return <ThanksForFeedback />;
    }
  }

  return (
    <Box>
      <FeedbackPhaseBannerView />
      <Drawer 
        aria-label="Feedback triage and submission form"
        open={isDrawerOpen} 
      >
        <Feedback />
      </Drawer>
    </Box>
  )
}

export default Feedback;
