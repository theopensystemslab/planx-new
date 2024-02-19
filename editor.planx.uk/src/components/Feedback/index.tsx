import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloseIcon from "@mui/icons-material/Close";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import WarningIcon from "@mui/icons-material/Warning";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import { styled } from "@mui/material/styles";
import SvgIcon from "@mui/material/SvgIcon";
import Typography from "@mui/material/Typography";
import {
  getInternalFeedbackMetadata,
  insertFeedbackMutation,
} from "lib/feedback";
import { useStore } from "pages/FlowEditor/lib/store";
import { BackButton } from "pages/Preview/Questions";
import React, { useEffect, useRef, useState } from "react";
import { usePrevious } from "react-use";
import FeedbackOption from "ui/public/FeedbackOption";

import FeedbackForm from "./FeedbackForm";
import FeedbackPhaseBanner from "./FeedbackPhaseBanner";

const FeedbackWrapper = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderTop: `1px solid ${theme.palette.border.main}`,
}));

const FeedbackRow = styled(Box)(({ theme }) => ({
  maxWidth: theme.breakpoints.values.formWrap,
  padding: theme.spacing(2, 0, 4),
}));

const FeedbackHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1, 0),
  position: "relative",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
}));

const FeedbackTitle = styled(Box)(({ theme }) => ({
  position: "relative",
  display: "flex",
  alignItems: "center",
  "& svg": {
    width: "28px",
    height: "auto",
    color: theme.palette.primary.dark,
    marginRight: theme.spacing(1),
  },
}));

const CloseButton = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  color: theme.palette.text.primary,
}));

const FeedbackBody = styled(Box)(({ theme }) => ({
  maxWidth: theme.breakpoints.values.formWrap,
}));

export type UserFeedback = {
  userContext?: string;
  userComment: string;
};

export interface FormProps {
  inputs: FeedbackFormInput[];
  handleSubmit: (values: UserFeedback) => void;
}

export type FeedbackFormInput = {
  name: keyof UserFeedback;
  label?: string;
  id?: string;
  ariaDescribedBy?: string;
};

const Feedback: React.FC = () => {
  type FeedbackCategory = "issue" | "idea" | "comment";

  type View = "banner" | "triage" | FeedbackCategory | "thanks";

  type ClickEvents = "close" | "back" | "triage" | FeedbackCategory;

  const [currentFeedbackView, setCurrentFeedbackView] =
    useState<View>("banner");
  const previousFeedbackView = usePrevious(currentFeedbackView);
  const breadcrumbs = useStore((state) => state.breadcrumbs);

  useEffect(() => {
    if (currentFeedbackView === "thanks") {
      setCurrentFeedbackView("banner");
    }
  }, [breadcrumbs]);

  const feedbackComponentRef = useRef<HTMLDivElement | null>(null);

  const shouldScrollToView = () => {
    switch (currentFeedbackView) {
      case "banner":
      case "thanks":
        return false;
      default:
        return true;
    }
  };

  useEffect(() => {
    if (shouldScrollToView()) {
      feedbackComponentRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [currentFeedbackView]);

  function handleFeedbackViewClick(event: ClickEvents) {
    switch (event) {
      case "close":
        setCurrentFeedbackView("banner");
        break;
      case "back":
        setCurrentFeedbackView("triage");
        break;
      default:
        setCurrentFeedbackView(event);
        break;
    }
  }

  async function handleFeedbackFormSubmit(values: UserFeedback) {
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

  interface TitleAndCloseProps {
    title: string;
    Icon?: typeof SvgIcon;
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
    if (previousFeedbackView === "banner") {
      return (
        <TitleAndCloseFeedbackHeader
          Icon={WarningIcon}
          title="Report an issue"
        />
      );
    } else
      return (
        <>
          <BackAndCloseFeedbackHeader />
          <FeedbackTitle>
            <WarningIcon />
            <Typography variant="h3" component="h2">
              Report an issue
            </Typography>
          </FeedbackTitle>
        </>
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

  function ShareAnIdea(): FCReturn {
    const shareFormInputs: FeedbackFormInput[] = [
      {
        name: "userComment",
        ariaDescribedBy: "idea-title",
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
        ariaDescribedBy: "comment-title",
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
      case "banner":
        return <FeedbackPhaseBannerView />;
      case "triage":
        return <Triage />;
      case "issue":
        return <ReportAnIssue />;
      case "idea":
        return <ShareAnIdea />;
      case "comment":
        return <ShareAComment />;
      case "thanks":
        return <ThanksForFeedback />;
    }
  }

  return (
    <Box ref={feedbackComponentRef}>
      <Feedback />
    </Box>
  );
};

export default Feedback;
