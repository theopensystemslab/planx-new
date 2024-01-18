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
import React from "react";
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
  return (
    <>
      <FeedbackWrapper>
        <FeedbackPhaseBanner />
      </FeedbackWrapper>

      <FeedbackWrapper>
        <Container maxWidth="contentWrap">
          <FeedbackRow>
            <FeedbackHeader>
              <Typography variant="h3" component="h2">
                What would you like to share?
              </Typography>
              <CloseButton>
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
            <FeedbackBody>
              <FeedbackOption icon={WarningIcon} label="Issue" showArrow />
              <FeedbackOption icon={LightbulbIcon} label="Idea" showArrow />
              <FeedbackOption icon={MoreHorizIcon} label="Comment" showArrow />
            </FeedbackBody>
          </FeedbackRow>
        </Container>
      </FeedbackWrapper>

      <FeedbackWrapper>
        <Container maxWidth="contentWrap">
          <FeedbackRow>
            <FeedbackHeader>
              <BackButton>
                <ArrowBackIcon fontSize="small" />
                Back
              </BackButton>
              <CloseButton>
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
            <FeedbackTitle>
              <WarningIcon />
              <Typography variant="h3" component="h2">
                Report an issue
              </Typography>
            </FeedbackTitle>
            <FeedbackBody>
              <FeedbackForm>
                <InputLabel
                  label="What were you doing?"
                  htmlFor="issue-input-1"
                >
                  <Input multiline bordered id="issue-input-1" />
                </InputLabel>
                <InputLabel label="What went wrong?" htmlFor="issue-input-2">
                  <Input multiline bordered id="issue-input-2" />
                </InputLabel>
                <FeedbackDisclaimer />
                <Button variant="contained" sx={{ marginTop: 2.5 }}>
                  Send feedback
                </Button>
              </FeedbackForm>
            </FeedbackBody>
          </FeedbackRow>
        </Container>
      </FeedbackWrapper>

      <FeedbackWrapper>
        <Container maxWidth="contentWrap">
          <FeedbackRow>
            <FeedbackHeader>
              <BackButton>
                <ArrowBackIcon fontSize="small" />
                Back
              </BackButton>
              <CloseButton>
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
            <FeedbackTitle>
              <LightbulbIcon />
              <Typography variant="h3" component="h2" id="idea-title">
                Share an idea
              </Typography>
            </FeedbackTitle>
            <FeedbackBody>
              <FeedbackForm>
                <Input multiline bordered aria-describedby="idea-title" />
                <FeedbackDisclaimer />
                <Button variant="contained" sx={{ marginTop: 2.5 }}>
                  Send feedback
                </Button>
              </FeedbackForm>
            </FeedbackBody>
          </FeedbackRow>
        </Container>
      </FeedbackWrapper>

      <FeedbackWrapper>
        <Container maxWidth="contentWrap">
          <FeedbackRow>
            <FeedbackHeader>
              <BackButton>
                <ArrowBackIcon fontSize="small" />
                Back
              </BackButton>
              <CloseButton>
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
            <FeedbackTitle>
              <MoreHorizIcon />
              <Typography variant="h3" component="h2" id="comment-title">
                Share a comment
              </Typography>
            </FeedbackTitle>
            <FeedbackBody>
              <FeedbackForm>
                <Input multiline bordered aria-describedby="comment-title" />
                <FeedbackDisclaimer />
                <Button variant="contained" sx={{ marginTop: 2.5 }}>
                  Send feedback
                </Button>
              </FeedbackForm>
            </FeedbackBody>
          </FeedbackRow>
        </Container>
      </FeedbackWrapper>

      <FeedbackWrapper>
        <Container maxWidth="contentWrap">
          <FeedbackRow>
            <FeedbackHeader>
              <Typography variant="h3" component="h2">
                Thank you for sharing feedback
              </Typography>
              <CloseButton>
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
            <FeedbackBody>
              <Typography variant="body1">
                We appreciate it lorem ipsum dolor sit amet, consectetuer
                adipiscing elit. Aenean commodo ligula eget dolor.
              </Typography>
            </FeedbackBody>
          </FeedbackRow>
        </Container>
      </FeedbackWrapper>
    </>
  );
};

export default FeedbackComponent;
