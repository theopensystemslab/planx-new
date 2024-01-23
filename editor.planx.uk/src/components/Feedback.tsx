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
  enum View {
    PhaseBanner,
    FeedbackTriage,
    ReportAnIssue,
    ShareAnIdea,
    ShareAComment,
    ThanksForFeedback,
  }

  enum ClickEvents {
    Close,
    Back,
    OpenTriage,
    OpenReportAnIssue,
    OpenShareAnIdea,
    OpenShareAComment,
  }

  const [currentFeedbackView, setCurrentFeedbackView] = useState<View>(
    View.PhaseBanner,
  );
  const previousFeedbackView = usePrevious(currentFeedbackView);

  function handleFeedbackViewClick(event: ClickEvents) {
    switch (event) {
      case ClickEvents.Close:
        setCurrentFeedbackView(View.PhaseBanner);
        break;
      case ClickEvents.Back:
        setCurrentFeedbackView(View.FeedbackTriage);
        break;
      case ClickEvents.OpenTriage:
        setCurrentFeedbackView(View.FeedbackTriage);
        break;
      case ClickEvents.OpenReportAnIssue:
        setCurrentFeedbackView(View.ReportAnIssue);
        break;
      case ClickEvents.OpenShareAnIdea:
        setCurrentFeedbackView(View.ShareAnIdea);
        break;
      case ClickEvents.OpenShareAComment:
        setCurrentFeedbackView(View.ShareAComment);
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

    setCurrentFeedbackView(View.ThanksForFeedback);
  };

  function BackAndCloseFeedbackHeader(): FCReturn {
    return (
      <FeedbackHeader>
        <BackButton onClick={() => handleFeedbackViewClick(ClickEvents.Back)}>
          <ArrowBackIcon fontSize="small" />
          Back
        </BackButton>
        <CloseButton onClick={() => handleFeedbackViewClick(ClickEvents.Close)}>
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
    icon?: any;
  }

  function TitleAndCloseFeedbackHeader(props: TitleAndCloseProps): FCReturn {
    return (
      <FeedbackHeader>
        <FeedbackTitle>
          {props.icon && <props.icon />}
          <Typography variant="h3" component="h2">
            {props.title}
          </Typography>
        </FeedbackTitle>
        <CloseButton onClick={() => handleFeedbackViewClick(ClickEvents.Close)}>
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
    if (previousFeedbackView === View.PhaseBanner) {
      return (
        <TitleAndCloseFeedbackHeader
          icon={WarningIcon}
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
          handleFeedbackClick={() =>
            handleFeedbackViewClick(ClickEvents.OpenTriage)
          }
          handleReportAnIssueClick={() =>
            handleFeedbackViewClick(ClickEvents.OpenReportAnIssue)
          }
        />
      </FeedbackWrapper>
    );
  }

  function FeedbackTriage(): FCReturn {
    return (
      <FeedbackWrapper>
        <Container maxWidth="contentWrap">
          <FeedbackRow>
            <TitleAndCloseFeedbackHeader title="What would you like to share?" />
            <FeedbackBody>
              <FeedbackOption
                handleClick={() =>
                  handleFeedbackViewClick(ClickEvents.OpenReportAnIssue)
                }
                Icon={WarningIcon}
                label="Issue"
                showArrow
              />
              <FeedbackOption
                handleClick={() =>
                  handleFeedbackViewClick(ClickEvents.OpenShareAnIdea)
                }
                Icon={LightbulbIcon}
                label="Idea"
                showArrow
              />
              <FeedbackOption
                handleClick={() =>
                  handleFeedbackViewClick(ClickEvents.OpenShareAComment)
                }
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

  function FeedbackReportAnIssue(): FCReturn {
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

  function FeedbackShareAnIdea(): FCReturn {
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

  function FeedbackShareAComment(): FCReturn {
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

  function FeedbackThanksForFeedback(): FCReturn {
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
      case View.PhaseBanner:
        return <FeedbackPhaseBannerView />;
      case View.FeedbackTriage:
        return <FeedbackTriage />;
      case View.ReportAnIssue:
        return <FeedbackReportAnIssue />;
      case View.ShareAnIdea:
        return <FeedbackShareAnIdea />;
      case View.ShareAComment:
        return <FeedbackShareAComment />;
      case View.ThanksForFeedback:
        return <FeedbackThanksForFeedback />;
    }
  }

  return <Feedback />;
};

export default FeedbackComponent;
