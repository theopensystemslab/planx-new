import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Grid from "@mui/material/Grid";
import Link from "@mui/material/Link";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Step from "@mui/material/Step";
import { stepIconClasses } from "@mui/material/StepIcon";
import StepLabel from "@mui/material/StepLabel";
import Stepper from "@mui/material/Stepper";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import {
  AlteredNode,
  HistoryItem,
  PublishFlowArgs,
  TemplatedFlows,
  ValidationCheck,
} from "lib/api/publishFlow/types";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useState } from "react";
import { FONT_WEIGHT_BOLD } from "theme";
import InputLabel from "ui/editor/InputLabel";
import ChecklistItem from "ui/shared/ChecklistItem/ChecklistItem";
import ErrorWrapper from "ui/shared/ErrorWrapper";
import Input from "ui/shared/Input/Input";

import { CopyButton } from "../../Settings/Flow/Visibility/FlowStatus/components/PublicLink";
import { AlteredNodesSummaryContent } from "./AlteredNodes";
import { ValidationChecks } from "./ValidationChecks";

interface NoChangesDialogProps {
  dialogOpen: boolean;
  setDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const DialogFooterActions = styled(DialogActions)(({ theme }) => ({
  position: "sticky",
  bottom: 0,
  left: 0,
  width: "100%",
  borderTop: `1px solid ${theme.palette.border.main}`,
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
    <DialogTitle variant="h3" component="h1" sx={{ px: 3, py: 2 }}>
      {`Check for changes to publish`}
    </DialogTitle>
    <DialogContent sx={{ p: 3 }}>
      <Typography variant="body2">{`No new changes to publish`}</Typography>
    </DialogContent>
    <DialogActions>
      <Button
        onClick={() => setDialogOpen(false)}
        variant="contained"
        color="secondary"
        sx={{ backgroundColor: "background.default" }}
      >
        Keep editing
      </Button>
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
  status: string;
  validationChecks: ValidationCheck[];
  previewURL: string;
  handlePublish: (args: PublishFlowArgs) => Promise<void>;
  templatedFlows?: TemplatedFlows;
}

export const ChangesDialog = (props: ChangesDialogProps) => {
  const {
    dialogOpen,
    setDialogOpen,
    alteredNodes,
    history,
    status,
    validationChecks,
    previewURL,
    handlePublish,
    templatedFlows,
  } = props;

  const [isTemplate] = useStore((state) => [state.isTemplate]);

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
        <DialogTitle variant="h3" component="h1" sx={{ px: 3, py: 2 }}>
          {`Review`}
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <>
            <ErrorWrapper
              error={showError ? `Fix errors before continuing` : ``}
            >
              <ValidationChecks
                validationChecks={validationChecks}
                expandedByDefault={atLeastOneFail}
              />
            </ErrorWrapper>
            <AlteredNodesSummaryContent
              alteredNodes={alteredNodes}
              title={status}
              history={history}
            />
          </>
        </DialogContent>
        <DialogFooterActions>
          <Button
            onClick={() => setDialogOpen(false)}
            variant="contained"
            color="secondary"
            sx={{ backgroundColor: "background.default" }}
          >
            Keep editing
          </Button>
          <Button
            data-testid="next-step-test-button"
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
        <DialogTitle variant="h3" component="h1" sx={{ px: 3, py: 2 }}>
          {`Test`}
        </DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", p: 3 }}>
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
                    id="test-confirmation-checkbox"
                    data-testid="test-confirmation-checkbox"
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
            data-testid="next-step-publish-button"
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
    const [summary, setSummary] = useState<string>("");
    const [showError, setShowError] = useState<boolean>(false);

    const changeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.value.trim().length) {
        setShowError(false);
      }
      setSummary(e.target.value);
    };

    const validateAndPublish = () => {
      const invalidInput = !summary || summary.trim().length === 0;
      const templatedFlowIds = templatedFlows?.map((flow) => flow.id);

      if (invalidInput) {
        setShowError(true);
      } else {
        handlePublish({ summary, templatedFlowIds });
        setActiveStep(0);
        setSummary("");
      }
    };

    return (
      <>
        <DialogTitle variant="h3" component="h1" sx={{ px: 3, py: 2 }}>
          {`Publish`}
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Typography variant="body2" mb={2}>
            {`This is the final step to publish your content. Summary messages help other editors on your team understand what is changing and will appear in the History tab in the editor sidebar.`}
          </Typography>
          <InputLabel label="Summarise the changes" htmlFor="summary">
            <ErrorWrapper
              error={
                showError ? "Provide a summary before publishing" : undefined
              }
              id="input-error-publishing-summary"
            >
              <Input
                id="summary"
                data-testid="publish-summary-input"
                bordered
                required
                type="text"
                name="summary"
                value={summary}
                multiline
                rows={2}
                onChange={(e) => changeInput(e)}
              />
            </ErrorWrapper>
          </InputLabel>
          {isTemplate && (
            <>
              <Typography variant="h4" component="h3" mt={2}>
                {`This flow is a template`}
              </Typography>
              <Typography variant="body2" my={2}>
                {`Publishing it will automatically update the contents of ${templatedFlows?.length || 0} templated flows. Each templated flow will still need to be reviewed and published by its' owner.`}
              </Typography>
              {templatedFlows?.length && templatedFlows.length > 0 && (
                <List
                  dense
                  disablePadding
                  sx={{ listStyleType: "disc", marginLeft: 2 }}
                >
                  {templatedFlows.map((templatedFlow) => (
                    <ListItem
                      key={templatedFlow.id}
                      dense
                      disablePadding
                      sx={{
                        display: "list-item",
                        fontSize: (theme) => theme.typography.body2,
                      }}
                    >
                      {`${templatedFlow.team.slug}/${templatedFlow.slug} (${templatedFlow.status})`}
                    </ListItem>
                  ))}
                </List>
              )}
            </>
          )}
        </DialogContent>
        <DialogFooterActions>
          <Button onClick={handleBack}>Back</Button>
          <Button
            data-testid="publish-button"
            color="primary"
            variant="contained"
            onClick={validateAndPublish}
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
      onClose={() => {
        setDialogOpen(false);
        setActiveStep(0);
      }}
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
          px: 3,
          backgroundColor: (theme) => theme.palette.background.default,
          borderBottom: `1px solid`,
          borderColor: (theme) => theme.palette.border.main,
        }}
      >
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel
              sx={(theme) => ({
                fontWeight: "bold",
                [`& .${stepIconClasses.completed} svg`]: {
                  color: theme.palette.success.main,
                },
                [`& .${stepIconClasses.active} svg`]: {
                  color: theme.palette.info.main,
                },
              })}
            >
              {label}
            </StepLabel>
          </Step>
        ))}
      </Stepper>
      <Box sx={{ overflowY: "scroll" }}>
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
