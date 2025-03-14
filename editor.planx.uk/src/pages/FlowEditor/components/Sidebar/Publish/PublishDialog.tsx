import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Link from "@mui/material/Link";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Stepper from "@mui/material/Stepper";
import Typography from "@mui/material/Typography";
import React, { useState } from "react";
import Input from "ui/shared/Input/Input";

import { AlteredNode, AlteredNodesSummaryContent } from "./AlteredNodes";
import { ValidationCheck, ValidationChecks } from "./ValidationChecks";

interface NoChangesDialogProps {
  dialogOpen: boolean;
  setDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

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
      <Button onClick={() => setDialogOpen(false)}>KEEP EDITING</Button>
      <Button color="primary" variant="contained" disabled={true}>
        PUBLISH
      </Button>
    </DialogActions>
  </Dialog>
);

interface ChangesDialogProps {
  dialogOpen: boolean;
  setDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  alteredNodes: AlteredNode[];
  lastPublishedTitle: string;
  validationChecks: ValidationCheck[];
  previewURL: string;
  summary?: string;
  setSummary: React.Dispatch<React.SetStateAction<string | undefined>>;
  handlePublish: () => Promise<void>;
}

export const ChangesDialog = (props: ChangesDialogProps) => {
  const {
    dialogOpen,
    setDialogOpen,
    alteredNodes,
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
    return (
      <>
        <DialogTitle variant="h3" component="h1">
          {`Review`}
        </DialogTitle>
        <DialogContent>
          <>
            <AlteredNodesSummaryContent
              alteredNodes={alteredNodes}
              lastPublishedTitle={lastPublishedTitle}
            />
            <ValidationChecks validationChecks={validationChecks} />
          </>
        </DialogContent>
        <DialogActions sx={{ paddingX: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>KEEP EDITING</Button>
          <Button color="primary" variant="contained" onClick={handleNext}>
            NEXT
          </Button>
        </DialogActions>
      </>
    );
  };

  const TestStep = () => {
    return (
      <>
        <DialogTitle variant="h3" component="h1">
          {`Test`}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            {`Preview these content changes in-service before publishing `}
            <Link href={previewURL} target="_blank">
              {`here (opens in a new tab).`}
            </Link>
          </Typography>
        </DialogContent>
        <DialogActions sx={{ paddingX: 2 }}>
          <Button onClick={handleBack}>BACK</Button>
          <Button color="primary" variant="contained" onClick={handleNext}>
            NEXT
          </Button>
        </DialogActions>
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
          <Input
            bordered
            required
            type="text"
            name="summary"
            value={summary || ""}
            placeholder="Summarise your changes..."
            onChange={(e) => setSummary(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ paddingX: 2 }}>
          <Button onClick={handleBack}>BACK</Button>
          <Button color="primary" variant="contained" onClick={handlePublish}>
            PUBLISH
          </Button>
        </DialogActions>
      </>
    );
  };

  return (
    <Dialog
      open={dialogOpen}
      onClose={() => setDialogOpen(false)}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      maxWidth="md"
    >
      <Box padding={2}>
        <Stepper activeStep={activeStep}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
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
