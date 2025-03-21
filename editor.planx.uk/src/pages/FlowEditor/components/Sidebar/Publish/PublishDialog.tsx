import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Grid from "@mui/material/Grid";
import Link from "@mui/material/Link";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Stepper from "@mui/material/Stepper";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import React, { useState } from "react";
import { FONT_WEIGHT_BOLD } from "theme";
import InputLabel from "ui/editor/InputLabel";
import ChecklistItem from "ui/shared/ChecklistItem/ChecklistItem";
import ErrorWrapper from "ui/shared/ErrorWrapper";
import Input from "ui/shared/Input/Input";

import { CopyButton } from "../../Settings/ServiceSettings/FlowStatus/PublicLink";
import { HistoryItem } from "../EditHistory";
import { AlteredNode, AlteredNodesSummaryContent } from "./AlteredNodes";
import { ValidationCheck, ValidationChecks } from "./ValidationChecks";

interface NoChangesDialogProps {
  dialogOpen: boolean;
  setDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const DialogFooterActions = styled(DialogActions)(({ theme }) => ({
  position: "absolute",
  bottom: 0,
  left: 0,
  width: "100%",
  padding: theme.spacing(2),
  background: theme.palette.background.paper,
  borderTop: `1px solid ${theme.palette.border.light}`,
  justifyContent: "space-between",
}));

export const NoChangesDialog = ({
  dialogOpen,
  setDialogOpen,
}: NoChangesDialogProps) => (
  <Dialog
    open={dialogOpen}
    onClose={() => setDialogOpen(false)}
    aria-labelledby="alert-dialog-title"
    aria-describedby="alert-dialog-description"
    maxWidth="md"
  >
    <DialogTitle variant="h3" component="h1">
      {`Check for changes to publish`}
    </DialogTitle>
    <DialogContent>
      <Typography variant="body2">{`No new changes to publish`}</Typography>
    </DialogContent>
    <DialogActions sx={{ paddingX: 2 }}>
      <Button onClick={() => setDialogOpen(false)}>Keep editing</Button>
      <Button color="primary" variant="contained" disabled={true}>
        Publish
      </Button>
    </DialogActions>
  </Dialog>
);

interface ChangesDialogProps {
  dialogOpen: boolean;
  setDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  alteredNodes: AlteredNode[];
  history?: HistoryItem[];
  lastPublishedTitle: string;
  validationChecks: ValidationCheck[];
  previewURL: string;
  summary: string;
  setSummary: React.Dispatch<React.SetStateAction<string>>;
  handlePublish: () => Promise<void>;
}

export const ChangesDialog = (props: ChangesDialogProps) => {
  const {
    dialogOpen,
    setDialogOpen,
    alteredNodes,
    history,
    lastPublishedTitle,
    validationChecks,
    previewURL,
    summary,
    setSummary,
    handlePublish,
  } = props;

  const steps = ["Review", "Test", "Publish"];
  const [activeStep, setActiveStep] = useState<number>(0);

  const handleNext = () => {
    setActiveStep(activeStep + 1);
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  const ReviewStep = () => {
    const [showError, setShowError] = useState<boolean>(false);
    const atLeastOneFail =
      validationChecks.filter((check) => check.status === "Fail").length > 0;

    return (
      <>
        <DialogTitle variant="h3" component="h1">
          {`Review`}
        </DialogTitle>
        <DialogContent>
          <>
            <ErrorWrapper
              error={showError ? `Fix errors before continuing` : ``}
            >
              <ValidationChecks validationChecks={validationChecks} />
            </ErrorWrapper>
            <AlteredNodesSummaryContent
              alteredNodes={alteredNodes}
              lastPublishedTitle={lastPublishedTitle}
              history={history}
            />
          </>
        </DialogContent>
        <DialogFooterActions sx={{ paddingX: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>Keep editing</Button>
          <Button
            color="primary"
            variant="contained"
            onClick={() => (atLeastOneFail ? setShowError(true) : handleNext())}
          >
            Next
          </Button>
        </DialogFooterActions>
      </>
    );
  };

  const TestStep = () => {
    const [completed, setCompleted] = useState<boolean>(false);
    const [showError, setShowError] = useState<boolean>(false);

    return (
      <>
        <DialogTitle variant="h3" component="h1">
          {`Test`}
        </DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column" }}>
          <Typography variant="h4" component="h2" mb={1}>
            {`Your preview link`}
            <CopyButton link={previewURL} isActive={true} />
          </Typography>
          <Typography variant="body2" mb={2}>
            <Link href={previewURL} target="_blank">
              {previewURL}
            </Link>
          </Typography>
          <Typography variant="body2">
            {`This link reflects how the public form will appear on next publish. You can share this link internally with others on your team without prompting them to log into the editor. Do not share this link publicly.`}
          </Typography>
          <Box marginTop={2}>
            <ErrorWrapper
              error={
                showError
                  ? `Confirm you have completed this step before continuing`
                  : ``
              }
              id={`test-step-completion-error`}
            >
              <Grid container component="fieldset" sx={{ margin: 0 }}>
                <Typography
                  component="legend"
                  variant="body2"
                  fontWeight={FONT_WEIGHT_BOLD}
                  gutterBottom
                  id={`test-step-completion-label`}
                >
                  {`Have you or your team previewed these changes?`}
                </Typography>
                <Grid item xs={12} sx={{ pointerEvents: "auto" }}>
                  <ChecklistItem
                    id={`test-confirmation-checkbox`}
                    label={`Yes, these changes have been tested`}
                    checked={completed}
                    onChange={() => {
                      setCompleted(!completed);
                      setShowError(false);
                    }}
                  />
                </Grid>
              </Grid>
            </ErrorWrapper>
          </Box>
        </DialogContent>
        <DialogFooterActions>
          <Button onClick={handleBack}>Back</Button>
          <Button
            color="primary"
            variant="contained"
            onClick={() => (completed ? handleNext() : setShowError(true))}
          >
            Next
          </Button>
        </DialogFooterActions>
      </>
    );
  };

  const PublishStep = () => {
    return (
      <>
        <DialogTitle variant="h3" component="h1">
          {`Publish`}
        </DialogTitle>
        <DialogContent>
          <InputLabel label="Summarise your changes" htmlFor="summary">
            <Input
              id="summary"
              bordered
              required
              type="text"
              name="summary"
              value={summary}
              multiline
              rows={2}
              onChange={(e) => setSummary(e.target.value)}
            />
          </InputLabel>
        </DialogContent>
        <DialogFooterActions>
          <Button onClick={handleBack}>Back</Button>
          <Button
            color="primary"
            variant="contained"
            onClick={() => {
              handlePublish();
              setActiveStep(0);
            }}
          >
            Publish
          </Button>
        </DialogFooterActions>
      </>
    );
  };

  return (
    <Dialog
      open={dialogOpen}
      fullWidth
      maxWidth="md"
      onClose={() => setDialogOpen(false)}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      PaperProps={{
        sx: {
          height: "100%",
          overflowY: "hidden",
        },
      }}
    >
      <Stepper
        activeStep={activeStep}
        sx={{
          padding: 2,
          backgroundColor: (theme) => theme.palette.background.default,
          borderBottom: `1px solid`,
          borderColor: (theme) => theme.palette.border.light,
        }}
      >
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel
              sx={(theme) => ({
                "& .MuiStepIcon-root.Mui-completed": {
                  color: theme.palette.success.main,
                },
              })}
            >
              {label}
            </StepLabel>
          </Step>
        ))}
      </Stepper>
      <Box padding={1} paddingBottom={8} sx={{ overflowY: "scroll" }}>
        {
          {
            0: <ReviewStep />,
            1: <TestStep />,
            2: <PublishStep />,
          }[activeStep]
        }
      </Box>
    </Dialog>
  );
};
