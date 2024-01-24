import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloseIcon from "@mui/icons-material/Close";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import WarningIcon from "@mui/icons-material/Warning";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import { styled } from "@mui/material/styles";
import SvgIcon from "@mui/material/SvgIcon";
import Typography from "@mui/material/Typography";
import { contentFlowSpacing } from "@planx/components/shared/Preview/Card";
import FeedbackPhaseBanner from "components/FeedbackPhaseBanner";
import { BackButton } from "pages/Preview/Questions";
import React, { useState } from "react";
import { usePrevious } from "react-use";
import FeedbackDisclaimer from "ui/public/FeedbackDisclaimer";
import FeedbackOption from "ui/public/FeedbackOption";
import InputLabel from "ui/public/InputLabel";
import Input from "ui/shared/Input";

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

const FeedbackForm = styled("form")(({ theme }) => ({
  "& > *": {
    ...contentFlowSpacing(theme),
  },
}));

const FeedbackComponent: React.FC = () => {
  type FeedbackCategory = "issue" | "idea" | "comment";

  type View = "banner" | "triage" | FeedbackCategory | "thanks";

  type ClickEvents = "close" | "back" | "triage" | FeedbackCategory;

  const [currentFeedbackView, setCurrentFeedbackView] =
    useState<View>("banner");
  const previousFeedbackView = usePrevious(currentFeedbackView);

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

  const handleFeedbackFormSubmit = (e: any) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const formDataPayload: any = {};

    for (const [key, value] of formData.entries()) {
      formDataPayload[key] = value;
    }

    console.log("The user inputs", formDataPayload);
    // Prep the form data payload?

    setCurrentFeedbackView("thanks");
  };

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
    return (
      <FeedbackWrapper>
        <Container maxWidth="contentWrap">
          <FeedbackRow>
            <ReportAnIssueTopBar />
            <FeedbackBody>
              <FeedbackForm onSubmit={(e) => handleFeedbackFormSubmit(e)}>
                <InputLabel
                  label="What were you doing?"
                  htmlFor="issue-input-1"
                >
                  <Input
                    required
                    multiline
                    bordered
                    id="issue-input-1"
                    name="userContext"
                  />
                </InputLabel>
                <InputLabel label="What went wrong?" htmlFor="issue-input-2">
                  <Input
                    required
                    multiline
                    bordered
                    id="issue-input-2"
                    name="userComment"
                  />
                </InputLabel>
                <FeedbackDisclaimer />
                <Button
                  type="submit"
                  variant="contained"
                  sx={{ marginTop: 2.5 }}
                >
                  Send feedback
                </Button>
              </FeedbackForm>
            </FeedbackBody>
          </FeedbackRow>
        </Container>
      </FeedbackWrapper>
    );
  }

  function ShareAnIdea(): FCReturn {
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
            <FeedbackBody onSubmit={(e) => handleFeedbackFormSubmit(e)}>
              <FeedbackForm>
                <Input
                  name="useComment"
                  required
                  multiline
                  bordered
                  aria-describedby="idea-title"
                />
                <FeedbackDisclaimer />
                <Button
                  type="submit"
                  variant="contained"
                  sx={{ marginTop: 2.5 }}
                >
                  Send feedback
                </Button>
              </FeedbackForm>
            </FeedbackBody>
          </FeedbackRow>
        </Container>
      </FeedbackWrapper>
    );
  }

  function ShareAComment(): FCReturn {
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
              <FeedbackForm onSubmit={(e) => handleFeedbackFormSubmit(e)}>
                <Input
                  name="userComment"
                  required
                  multiline
                  bordered
                  aria-describedby="comment-title"
                />
                <FeedbackDisclaimer />
                <Button
                  type="submit"
                  variant="contained"
                  sx={{ marginTop: 2.5 }}
                >
                  Send feedback
                </Button>
              </FeedbackForm>
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
            <TitleAndCloseFeedbackHeader title="Thank you for sharing feedback" />
            <FeedbackBody>
              <Typography variant="body1">
                We appreciate it lorem ipsum dolor sit amet, consectetuer
                adipiscing elit. Aenean commodo ligula eget dolor.
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

  return <Feedback />;
};

export default FeedbackComponent;
